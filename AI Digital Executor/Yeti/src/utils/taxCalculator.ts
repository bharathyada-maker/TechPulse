import taxRulesData from '../config/tax-rules.json';

export interface TaxRules {
  label: string;
  description: string;
  cessRate: number;
  standardDeductionSalaried: {
    oldRegime: number;
    newRegime: number;
  };
  rebate87A: {
    oldRegime: { maxIncome: number; maxRebate: number };
    newRegime: { maxIncome: number; maxRebate: number };
  };
  slabs: {
    oldRegime: Array<{ min: number; max: number | null; rate: number }>;
    newRegime: Array<{ min: number; max: number | null; rate: number }>;
  };
  deductionsCatalog: {
    [key: string]: {
      label: string;
      description: string;
      limit?: number;
      limitSenior?: number;
      limitGeneral?: number;
      applicableInNewRegime: boolean;
    };
  };
  surcharges: Array<{ minIncome: number; maxIncome: number | null; rate: number }>;
}

export interface IncomeSources {
  salary: number;
  allowanceHRA: number;
  basicSalary: number;
  rentPaid: number;
  isMetro: boolean;
  businessIncome: number;
  businessExpenses: number;
  capitalGainsShort: number; // STCG (15% or normal, let's treat STCG as special/normal)
  capitalGainsLong: number;  // LTCG (10% or 12.5%, let's keep it in income or calculate standard)
  otherInterest: number;
  otherDividend: number;
  cryptoIncome: number;
  foreignIncome: number;
}

export interface ClaimedDeductions {
  section80C: number;
  section80D_self: number;
  isSelfSenior: boolean;
  section80D_parents: number;
  areParentsSenior: boolean;
  section80CCD_1B: number; // NPS self
  section80TTA: number; // savings interest
  section24B_homeLoan: number; // home loan interest
  otherDeductions: number;
}

export interface CalculationBreakdown {
  grossIncome: number;
  hraExemption: number;
  standardDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  slabTaxBreakdown: Array<{ slab: string; tax: number; rate: number }>;
  baseTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
}

export interface CalculationResult {
  oldRegime: CalculationBreakdown;
  newRegime: CalculationBreakdown;
  optimalRegime: 'oldRegime' | 'newRegime';
  taxSavings: number;
  calculationSteps: string[];
}

export function calculateTax(
  yearKey: 'AY-2025-26' | 'AY-2024-25',
  income: IncomeSources,
  deductions: ClaimedDeductions,
  customRules?: any // In case rules are edited in the Admin Panel
): CalculationResult {
  // Load rules
  const allRules = customRules || (taxRulesData as any);
  const rules: TaxRules = allRules.assessmentYears[yearKey];

  if (!rules) {
    throw new Error(`Rules for assessment year ${yearKey} not found.`);
  }

  const steps: string[] = [];
  steps.push(`Initializing tax calculation for Assessment Year ${yearKey}`);

  // Helper HRA Exemption Calculator (Only applicable in Old Regime)
  const calculateHraExemption = (): number => {
    if (income.allowanceHRA <= 0 || income.rentPaid <= 0) return 0;
    
    // If basic salary is not specified, assume 50% of gross salary
    const basic = income.basicSalary > 0 ? income.basicSalary : income.salary * 0.5;
    
    // 1. Actual HRA received
    const actualHRA = income.allowanceHRA;
    // 2. Rent Paid - 10% of Basic
    const rentMinusTenPercentBasic = Math.max(0, income.rentPaid - basic * 0.1);
    // 3. 50% of Basic (Metro) or 40% (Non-Metro)
    const percentageBasic = basic * (income.isMetro ? 0.5 : 0.4);

    const exemption = Math.min(actualHRA, rentMinusTenPercentBasic, percentageBasic);
    steps.push(`HRA Exemption calculation details:`);
    steps.push(`- Actual HRA: ₹${actualHRA.toLocaleString()}`);
    steps.push(`- Rent Paid - 10% of Basic: ₹${rentMinusTenPercentBasic.toLocaleString()} (Rent: ₹${income.rentPaid.toLocaleString()}, Basic: ₹${basic.toLocaleString()})`);
    steps.push(`- HRA City Limit (50%/40% of Basic): ₹${percentageBasic.toLocaleString()} (${income.isMetro ? 'Metro' : 'Non-Metro'})`);
    steps.push(`- Allowed HRA Exemption: ₹${exemption.toLocaleString()}`);
    return exemption;
  };

  const oldHraExemption = calculateHraExemption();

  // Gross Income Computation
  const businessNet = Math.max(0, income.businessIncome - income.businessExpenses);
  // Total Gross Income
  const grossSalary = income.salary;
  const otherIncome = income.otherInterest + income.otherDividend + income.cryptoIncome + income.foreignIncome;
  const capitalGains = income.capitalGainsShort + income.capitalGainsLong;
  
  const totalGrossIncome = grossSalary + businessNet + otherIncome + capitalGains;
  steps.push(`Gross Income calculated: ₹${totalGrossIncome.toLocaleString()} (Salary: ₹${grossSalary.toLocaleString()}, Business Net: ₹${businessNet.toLocaleString()}, Capital Gains: ₹${capitalGains.toLocaleString()}, Others: ₹${otherIncome.toLocaleString()})`);

  // Calculate under a specific regime
  const calculateRegime = (regime: 'oldRegime' | 'newRegime', hraExemp: number): CalculationBreakdown => {
    const isNew = regime === 'newRegime';
    const standardDed = isNew ? rules.standardDeductionSalaried.newRegime : rules.standardDeductionSalaried.oldRegime;

    // Deductions computation
    let totalDeds = 0;
    const itemizedDeds = [];

    // Standard deduction is applicable to salary income up to the salary amount or standard deduction limit
    const appliedStandardDed = grossSalary > 0 ? Math.min(grossSalary, standardDed) : 0;
    if (appliedStandardDed > 0) {
      totalDeds += appliedStandardDed;
      itemizedDeds.push(`Standard Deduction: ₹${appliedStandardDed.toLocaleString()}`);
    }

    if (!isNew) {
      // HRA Exemption
      if (hraExemp > 0) {
        totalDeds += hraExemp;
        itemizedDeds.push(`HRA Exemption: ₹${hraExemp.toLocaleString()}`);
      }

      // 80C
      const cap80C = rules.deductionsCatalog.section80C.limit || 150000;
      const applied80C = Math.min(deductions.section80C, cap80C);
      if (applied80C > 0) {
        totalDeds += applied80C;
        itemizedDeds.push(`Sec 80C: ₹${applied80C.toLocaleString()} (Max ₹${cap80C.toLocaleString()})`);
      }

      // 80D Self
      const cap80DSelf = deductions.isSelfSenior 
        ? (rules.deductionsCatalog.section80D_self.limitSenior || 50000) 
        : (rules.deductionsCatalog.section80D_self.limit || 25000);
      const applied80DSelf = Math.min(deductions.section80D_self, cap80DSelf);
      if (applied80DSelf > 0) {
        totalDeds += applied80DSelf;
        itemizedDeds.push(`Sec 80D (Self): ₹${applied80DSelf.toLocaleString()} (Max ₹${cap80DSelf.toLocaleString()}${deductions.isSelfSenior ? ' - Senior' : ''})`);
      }

      // 80D Parents
      const cap80DParents = deductions.areParentsSenior 
        ? (rules.deductionsCatalog.section80D_parents.limitSenior || 50000) 
        : (rules.deductionsCatalog.section80D_parents.limit || 25000);
      const applied80DParents = Math.min(deductions.section80D_parents, cap80DParents);
      if (applied80DParents > 0) {
        totalDeds += applied80DParents;
        itemizedDeds.push(`Sec 80D (Parents): ₹${applied80DParents.toLocaleString()} (Max ₹${cap80DParents.toLocaleString()}${deductions.areParentsSenior ? ' - Senior' : ''})`);
      }

      // 80CCD(1B) NPS
      const capNps = rules.deductionsCatalog.section80CCD_1B.limit || 50000;
      const appliedNps = Math.min(deductions.section80CCD_1B, capNps);
      if (appliedNps > 0) {
        totalDeds += appliedNps;
        itemizedDeds.push(`Sec 80CCD(1B) NPS: ₹${appliedNps.toLocaleString()} (Max ₹${capNps.toLocaleString()})`);
      }

      // 80TTA/TTB
      const capTta = deductions.isSelfSenior 
        ? (rules.deductionsCatalog.section80TTA.limitSenior || 50000) 
        : (rules.deductionsCatalog.section80TTA.limitGeneral || 10000);
      const interestClaimed = deductions.section80TTA;
      const appliedTta = Math.min(interestClaimed, capTta);
      if (appliedTta > 0) {
        totalDeds += appliedTta;
        itemizedDeds.push(`Sec 80TTA/TTB Interest Exemption: ₹${appliedTta.toLocaleString()} (Max ₹${capTta.toLocaleString()})`);
      }

      // Section 24(b) Home Loan Interest
      const capHomeLoan = rules.deductionsCatalog.section24B_homeLoan.limit || 200000;
      const appliedHomeLoan = Math.min(deductions.section24B_homeLoan, capHomeLoan);
      if (appliedHomeLoan > 0) {
        totalDeds += appliedHomeLoan;
        itemizedDeds.push(`Sec 24(b) Home Loan Interest: ₹${appliedHomeLoan.toLocaleString()} (Max ₹${capHomeLoan.toLocaleString()})`);
      }

      // Other custom deductions
      if (deductions.otherDeductions > 0) {
        totalDeds += deductions.otherDeductions;
        itemizedDeds.push(`Other Deductions: ₹${deductions.otherDeductions.toLocaleString()}`);
      }
    }

    // Net Taxable Income
    const taxableIncome = Math.max(0, totalGrossIncome - totalDeds);
    
    // Slab tax calculation
    const activeSlabs = isNew ? rules.slabs.newRegime : rules.slabs.oldRegime;
    let baseTax = 0;
    const slabTaxBreakdown: Array<{ slab: string; tax: number; rate: number }> = [];

    let remainingIncome = taxableIncome;
    for (let i = 0; i < activeSlabs.length; i++) {
      const slab = activeSlabs[i];
      const min = slab.min;
      const max = slab.max;
      const rate = slab.rate;

      if (remainingIncome <= 0) break;

      let slabWidth = 0;
      let label = "";
      if (max === null) {
        slabWidth = remainingIncome;
        label = `Above ₹${min.toLocaleString()}`;
      } else {
        slabWidth = Math.min(remainingIncome, max - min);
        label = `₹${min.toLocaleString()} to ₹${max.toLocaleString()}`;
      }

      const slabTax = slabWidth * rate;
      if (slabWidth > 0 && slabTax >= 0) {
        baseTax += slabTax;
        slabTaxBreakdown.push({ slab: label, tax: slabTax, rate });
        remainingIncome -= slabWidth;
      }
    }

    // Rebate 87A
    const rebateRule = isNew ? rules.rebate87A.newRegime : rules.rebate87A.oldRegime;
    let rebateApplied = 0;
    if (taxableIncome <= rebateRule.maxIncome) {
      rebateApplied = Math.min(baseTax, rebateRule.maxRebate);
    }
    const taxAfterRebate = Math.max(0, baseTax - rebateApplied);

    // Surcharge
    let surchargeRate = 0;
    for (const s of rules.surcharges) {
      if (taxableIncome > s.minIncome && (s.maxIncome === null || taxableIncome <= s.maxIncome)) {
        surchargeRate = s.rate;
        break;
      }
    }
    // Surcharges for high income earners
    const surchargeVal = taxAfterRebate * surchargeRate;

    // Cess
    const cessVal = (taxAfterRebate + surchargeVal) * rules.cessRate;

    const totalTax = taxAfterRebate + surchargeVal + cessVal;

    return {
      grossIncome: totalGrossIncome,
      hraExemption: isNew ? 0 : hraExemp,
      standardDeduction: appliedStandardDed,
      totalDeductions: totalDeds,
      taxableIncome,
      slabTaxBreakdown,
      baseTax,
      rebate87A: rebateApplied,
      taxAfterRebate,
      surcharge: surchargeVal,
      cess: cessVal,
      totalTax
    };
  };

  const oldBreakdown = calculateRegime('oldRegime', oldHraExemption);
  const newBreakdown = calculateRegime('newRegime', 0);

  // Determine optimal regime
  const optimalRegime = oldBreakdown.totalTax <= newBreakdown.totalTax ? 'oldRegime' : 'newRegime';
  const taxSavings = Math.abs(oldBreakdown.totalTax - newBreakdown.totalTax);

  steps.push(`Regime comparison finished:`);
  steps.push(`- Old Regime Total Tax: ₹${oldBreakdown.totalTax.toFixed(2)} (Taxable Income: ₹${oldBreakdown.taxableIncome.toLocaleString()})`);
  steps.push(`- New Regime Total Tax: ₹${newBreakdown.totalTax.toFixed(2)} (Taxable Income: ₹${newBreakdown.taxableIncome.toLocaleString()})`);
  steps.push(`- Optimal Selection: ${optimalRegime === 'oldRegime' ? 'Old Regime' : 'New Regime'}`);
  steps.push(`- Net savings of selecting optimal: ₹${taxSavings.toFixed(2)}`);

  return {
    oldRegime: oldBreakdown,
    newRegime: newBreakdown,
    optimalRegime,
    taxSavings,
    calculationSteps: steps
  };
}
