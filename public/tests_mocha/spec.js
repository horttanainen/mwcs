/*global it, sol, describe, expect, before */
describe('Tesing csv_parser', function () {
  var parsed_line;

  before(function() {
    parsed_line = sol.csv_handler.splitLine( 'John Smith, 8, 26.3.2014, 13:15, 2:00' );
  });
  
  it( 'csv lineParser parses date correctly', function () {
    expect( parsed_line.date.getTime() )
      .to.be.equal( new Date(2014, 3, 26 ).getTime() );
  });
  
  it( 'csv lineParser parses date_start correctly', function () {
    expect( parsed_line.date_start.getTime() )
      .to.be.equal( new Date( 2014, 3, 26, 13, 15 ).getTime() );
  });

  it( 'csv lineParser parses date_end correctly', function () {
    expect( parsed_line.date_end.getTime() )
      .to.be.equal( new Date( 2014, 3, 27, 2 ).getTime() );
  });

  it( 'csv lineParser parses employee correctly', function () {
    var employee = parsed_line.employee;
    expect(employee.name).to.be.equal('John Smith');
  });

  it( 'parsed employee gets added to taffyDb', function () {
    var employees_db = sol.model.employees.get_db();
    expect( employees_db({ id : 8 }).first() )
      .to.not.be.equal( false );
  });

  it( 'parsed shift gets added to taffyDb', function () {
    var shift_db = sol.model.shifts.get_db();
    expect( shift_db({ id : 0 }).first() )
      .to.not.be.equal( false );
  });

});

describe('Tesing employee model', function () {
  var employees_db;
  
  before(function () {
    sol.model.employees.clear_db();
    employees_db = sol.model.employees.get_db();
  });

  it( 'employee database should be empty at first', function () {
    expect( employees_db().first() )
      .to.be.equal( false );
  });

  it( 'makeEmployee should return employee and add to employeedb', function () {
    var employee;

    employee = sol.model.makeEmployee({
      name : 'Santeri Horttanainen',
      id : 5 
    });

    expect( employees_db().first() )
      .to.be.equal( employee );
  });

  it( 'getEmployee finds employee from employee db if employee exists', function () {
    var employee;
    sol.model.makeEmployee({
        name : 'Santeri Horttanainen',
        id : 5 
    });

    employee = sol.model.employees.get_employee({ id : 5, name : 'Santeri VaaraSukumnimi'});

    expect( employee.name ).to.be.equal( 'Santeri Horttanainen' );
  });

  it( 'getEmployee creates employee if employee doesnt exists', function () {
    var employee;

    employee = sol.model.employees.get_employee({ id : 5, name : 'Santeri Horttanainen'});

    expect( employee.name ).to.be.equal( 'Santeri Horttanainen' );
  });

  it( 'makeEmployee returns employee and adds to employee_db', function () {
    var employee;
    sol.model.makeEmployee({
        name : 'Santeri Horttanainen',
        id : 5 
    });

    employee = sol.model.employees.get_db()({ id : 5}).first();

    expect( employee.name ).to.be.equal( 'Santeri Horttanainen' );
  });

  it( 'clear employee db works as ecpected', function () {

    expect( employees_db().get().length )
      .to.be.above( 0 );

    sol.model.employees.clear_db();
    
    expect( employees_db().get.length )
      .to.be.equal( 0 );
  });

});

describe('Tesing shift model', function () {
  var account_db;
  
  before(function () {
    sol.model.shifts.clear_db();
    account_db = sol.model.shifts.get_db();
  });

  it( 'account database should be empty at first', function () {
    expect( account_db().first() )
      .to.be.equal( false );
  });

  it( 'makeShift should return shift and add it to account_db', function () {
    var shift, employee;

    employee = sol.model.makeEmployee({
        name : 'Santeri Horttanainen',
        id : 5 
    });

    shift = sol.model.makeShift({
      employee    : employee,
      date        : new Date( 2015, 10, 5 ),
      date_start  : new Date( 2015, 10, 5, 8, 15 ),
      date_end    : new Date( 2015, 10, 5, 18, 30 )
    });

    expect( account_db().first() )
      .to.be.equal( shift );
  });

  it( 'makeShift should create id for shift', function () {
    var employee, shifts;

    expect( account_db().first().id )
      .to.be.equal( 0 );

    employee = sol.model.employees.get_employee({
        name : 'Santeri Horttanainen',
        id : 5 
    });

    sol.model.makeShift({
      employee    : employee,
      date        : new Date( 2016, 10, 5 ),
      date_start  : new Date( 2016, 10, 5, 8, 15 ),
      date_end    : new Date( 2016, 10, 5, 18, 30 )
    });

    shifts = account_db({ employee_id : 5 }).get();

    expect( shifts[0].id )
      .to.be.not.equal( shifts[1].id );
  });

  it( 'clear account_db works as ecpected', function () {

    expect( account_db().get().length )
      .to.be.above( 0 );

    sol.model.shifts.clear_db();
    
    expect( account_db().get.length )
      .to.be.equal( 0 );
  });

});


describe('Tesing calculator', function () {
  var shift1, shift2, employee1, employee2,
    shift3, shift4, shift5, shift6, shift7,
    shift8, shift9, shift10;
  
  before(function () {
    sol.model.employees.clear_db();
    sol.model.shifts.clear_db();

    employee1 = sol.model.employees.get_employee({
        name : 'Santeri Horttanainen',
        id : 5 
    });

    employee2 = sol.model.employees.get_employee({
        name : 'Sami Horttanainen',
        id : 75 
    });

    shift1 = sol.model.makeShift({
      employee    : employee1,
      date        : new Date( 2016, 10, 5 ),
      date_start  : new Date( 2016, 10, 5, 8, 15 ),
      date_end    : new Date( 2016, 10, 5, 15 )
    });

    shift2 = sol.model.makeShift({
      employee    : employee2,
      date        : new Date( 2016, 11, 5 ),
      date_start  : new Date( 2016, 11, 5, 4, 30 ),
      date_end    : new Date( 2016, 11, 5, 17, 15 )
    });

    shift3 = sol.model.makeShift({
      employee    : employee2,
      date        : new Date( 2016, 11, 5 ),
      date_start  : new Date( 2016, 11, 5, 8, 30 ),
      date_end    : new Date( 2016, 11, 5, 20 )
    });

    shift4 = sol.model.makeShift({
      employee    : employee2,
      date        : new Date( 2016, 11, 5 ),
      date_start  : new Date( 2016, 11, 5, 2 ),
      date_end    : new Date( 2016, 11, 5, 23 )
    });

    shift5 = sol.model.makeShift({
      employee    : employee2,
      date        : new Date( 2016, 11, 5 ),
      date_start  : new Date( 2016, 11, 5, 19, 45 ),
      date_end    : new Date( 2016, 11, 6, 5, 15 )
    });

    shift6 = sol.model.makeShift({
      employee    : employee2,
      date        : new Date( 2016, 11, 5 ),
      date_start  : new Date( 2016, 11, 5, 19, 45 ),
      date_end    : new Date( 2016, 11, 6, 12 )
    });

    shift7 = sol.model.makeShift({
      employee    : employee2,
      date        : new Date( 2016, 11, 5 ),
      date_start  : new Date( 2016, 11, 5, 19, 45 ),
      date_end    : new Date( 2016, 11, 6, 20 )
    });

    shift8 = sol.model.makeShift({
      employee    : employee2,
      date        : new Date( 2016, 11, 5 ),
      date_start  : new Date( 2016, 11, 5, 10 ),
      date_end    : new Date( 2016, 11, 5, 20 )
    });

    shift9 = sol.model.makeShift({
      employee    : employee2,
      date        : new Date( 2016, 11, 5 ),
      date_start  : new Date( 2016, 11, 5, 10 ),
      date_end    : new Date( 2016, 11, 5, 22 )
    });

    shift10 = sol.model.makeShift({
      employee    : employee2,
      date        : new Date( 2016, 11, 5 ),
      date_start  : new Date( 2016, 11, 5, 10 ),
      date_end    : new Date( 2016, 11, 6, 1)
    });
  });

  it( 'evening hours should return zero for shift without evening hours', function (){
    var evening_hours = sol.salary_calculator.eveningHoursInShift( shift1 );

    expect( evening_hours ).to.be.equal( 0 );
  });

  it( 'evening hours should return hours for shift starting before evening', function (){
    var evening_hours = sol.salary_calculator.eveningHoursInShift( shift2 );

    expect( evening_hours ).to.be.equal( 1.5 );
  });

  it( 'evening hours should return hours for shift ending after evening', function (){
    var evening_hours = sol.salary_calculator.eveningHoursInShift( shift3 );

    expect( evening_hours ).to.be.equal( 2 );
  });

  it( 'evening hours should return hours for shift starting before evening and ending after', function (){
    var evening_hours = sol.salary_calculator.eveningHoursInShift( shift4 );

    expect( evening_hours ).to.be.equal( 9 );
  });

  it( 'evening hours should return hours for shift starting after evening and ending before morning', function (){
    var evening_hours = sol.salary_calculator.eveningHoursInShift( shift5 );

    expect( evening_hours ).to.be.equal( 9.5 );
  });

  it( 'evening hours should return hours for shift starting after evening and ending after morning', function (){
    var evening_hours = sol.salary_calculator.eveningHoursInShift( shift6 );

    expect( evening_hours ).to.be.equal( 10.25 );
  });

  it( 'evening hours should return hours for shift starting after evening and ending after next evening', function (){
    var evening_hours = sol.salary_calculator.eveningHoursInShift( shift7 );

    expect( evening_hours ).to.be.equal( 12.25 );
  });

  it( 'Overtime compensation should be zero for no overtime', function (){
    var overtime_compensation = sol.salary_calculator.overtimeCompensationForShift( shift1 );

    expect( overtime_compensation ).to.be.equal( 0 );
  });

  it( 'Overtime compensation should be 1.88 for two hours of overtime', function (){
    var overtime_compensation = sol.salary_calculator.overtimeCompensationForShift( shift8 );

    expect( overtime_compensation ).to.be.equal( 1.88 );
  });

  it( 'Overtime compensation should be 5.63 for four hours of overtime', function (){
    var overtime_compensation = sol.salary_calculator.overtimeCompensationForShift( shift9 );

    expect( overtime_compensation ).to.be.equal( 5.63 );
  });

  it( 'Overtime compensation should be 16.88 for seven hours of overtime', function (){
    var overtime_compensation = sol.salary_calculator.overtimeCompensationForShift( shift10 );

    expect( overtime_compensation ).to.be.equal( 16.88 );
  });

  it( 'total pay for shift is calculated correctly', function () {
    var total_pay = sol.salary_calculator.totalPayForShift( shift6 );

    expect( total_pay ).to.be.equal( 63.35 );
  });

});
