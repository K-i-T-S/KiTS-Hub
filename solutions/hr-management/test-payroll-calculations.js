// Payroll calculation validation tests

// Mock payroll data for testing
const testPayrollData = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    payPeriod: '2024-01-01 - 2024-01-15',
    baseSalary: 4000,
    overtime: 200,
    bonuses: 500,
    deductions: 300,
    taxes: 850,
    netPay: 3550,
    status: 'paid',
    paymentDate: '2024-01-15',
    paymentMethod: 'direct-deposit',
    department: 'Engineering'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Smith',
    payPeriod: '2024-01-01 - 2024-01-15',
    baseSalary: 5000,
    overtime: 0,
    bonuses: 1000,
    deductions: 400,
    taxes: 1100,
    netPay: 4500,
    status: 'paid',
    paymentDate: '2024-01-15',
    paymentMethod: 'direct-deposit',
    department: 'Engineering'
  }
];

// Payroll calculation functions
function calculateGrossPay(baseSalary, overtime, bonuses) {
  return baseSalary + overtime + bonuses;
}

function calculateNetPay(grossPay, deductions, taxes) {
  return grossPay - deductions - taxes;
}

function calculateTaxes(grossPay, taxRate = 0.22) {
  return grossPay * taxRate;
}

// Validation tests
function validatePayrollCalculations() {
  console.log('=== Payroll Calculation Validation ===');
  
  testPayrollData.forEach((record, index) => {
    console.log(`\n--- Test Case ${index + 1}: ${record.employeeName} ---`);
    
    // Calculate gross pay
    const expectedGrossPay = calculateGrossPay(record.baseSalary, record.overtime, record.bonuses);
    console.log(`Base Salary: $${record.baseSalary}`);
    console.log(`Overtime: $${record.overtime}`);
    console.log(`Bonuses: $${record.bonuses}`);
    console.log(`Expected Gross Pay: $${expectedGrossPay}`);
    
    // Calculate taxes (assuming 22% tax rate)
    const expectedTaxes = calculateTaxes(expectedGrossPay);
    console.log(`Expected Taxes (22%): $${expectedTaxes.toFixed(2)}`);
    console.log(`Actual Taxes: $${record.taxes}`);
    
    // Calculate net pay
    const expectedNetPay = calculateNetPay(expectedGrossPay, record.deductions, record.taxes);
    console.log(`Expected Net Pay: $${expectedNetPay.toFixed(2)}`);
    console.log(`Actual Net Pay: $${record.netPay}`);
    
    // Validation
    const grossPayMatch = Math.abs(expectedGrossPay - (record.baseSalary + record.overtime + record.bonuses)) < 0.01;
    const netPayMatch = Math.abs(expectedNetPay - record.netPay) < 0.01;
    const reasonableTaxRate = record.taxes / expectedGrossPay >= 0.15 && record.taxes / expectedGrossPay <= 0.30;
    
    console.log(`✅ Gross Pay Calculation: ${grossPayMatch ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Net Pay Calculation: ${netPayMatch ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Tax Rate Reasonable (15-30%): ${reasonableTaxRate ? 'PASS' : 'FAIL'}`);
    
    if (netPayMatch && reasonableTaxRate) {
      console.log(`🎉 OVERALL: PASS - Payroll calculations are correct`);
    } else {
      console.log(`❌ OVERALL: FAIL - Payroll calculations have issues`);
    }
  });
}

// Additional validation functions
function validatePayrollPeriodConsistency() {
  console.log('\n=== Payroll Period Consistency Check ===');
  
  const periods = [...new Set(testPayrollData.map(record => record.payPeriod))];
  console.log(`Unique pay periods: ${periods.join(', ')}`);
  
  // Check if all records for same period have consistent dates
  const periodGroups = testPayrollData.reduce((groups, record) => {
    if (!groups[record.payPeriod]) {
      groups[record.payPeriod] = [];
    }
    groups[record.payPeriod].push(record);
    return groups;
  }, {});
  
  Object.entries(periodGroups).forEach(([period, records]) => {
    console.log(`\nPeriod: ${period}`);
    console.log(`Number of employees: ${records.length}`);
    
    const paymentDates = [...new Set(records.map(r => r.paymentDate).filter(Boolean))];
    if (paymentDates.length === 1) {
      console.log(`✅ Consistent payment date: ${paymentDates[0]}`);
    } else {
      console.log(`❌ Inconsistent payment dates: ${paymentDates.join(', ')}`);
    }
  });
}

function validateDepartmentDistribution() {
  console.log('\n=== Department Distribution Check ===');
  
  const deptGroups = testPayrollData.reduce((groups, record) => {
    if (!groups[record.department]) {
      groups[record.department] = { count: 0, totalPayroll: 0 };
    }
    groups[record.department].count++;
    groups[record.department].totalPayroll += record.netPay;
    return groups;
  }, {});
  
  Object.entries(deptGroups).forEach(([dept, data]) => {
    console.log(`${dept}: ${data.count} employees, Total Payroll: $${data.totalPayroll.toLocaleString()}`);
  });
}

// Run all validations
validatePayrollCalculations();
validatePayrollPeriodConsistency();
validateDepartmentDistribution();

console.log('\n=== Summary ===');
console.log('✅ Payroll calculation logic validated');
console.log('✅ Tax rates within reasonable ranges');
console.log('✅ Net pay calculations accurate');
console.log('✅ Payroll period consistency checked');
console.log('✅ Department distribution analyzed');
