/*global TAFFY, $, sol */

sol.model = (function () {
  'use strict';

  var
    stateMap = {
      account_db   : TAFFY(),
      employee_db  : TAFFY(),
      account_cid  : 0,
    },
    accounts, employees, makeEmployee,
    makeShift, employeeProto, accountProto;

  employeeProto = {
    total_earn      : 0,
    total_hours     : 0,
    regular_earn    : 0,
    regular_hours   : 0,
    overtime_earn   : 0,
    overtime_hours  : 0,
    evening_earn    : 0,
    evening_hours   : 0
  };
  accountProto = {
    total_earn      : 0,
    total_hours     : 0,
    regular_earn    : 0,
    regular_hours   : 0,
    overtime_earn   : 0,
    overtime_hours  : 0,
    evening_earn    : 0,
    evening_hours   : 0
  };

  makeEmployee = function ( employee_map ) {
    var employee,
      name = employee_map.name,
      id   = employee_map.id;

    employee      = Object.create( employeeProto );
    employee.name = name;
    employee.id   = id;

    stateMap.employee_db.insert( employee );
    return employee;
  };

  makeShift = function ( shift_map ) {
    var shift,
      employee      = shift_map.employee,
      date          = shift_map.date,
      shift_start   = shift_map.date_start,
      shift_end     = shift_map.date_end;
    
    shift             = Object.create( accountProto );
    shift.employee_id = employee.id;
    shift.date        = date;
    shift.shift_start = shift_start;
    shift.shift_end   = shift_end;
    shift.id          = stateMap.account_cid++;

    stateMap.account_db.insert( shift );
    return shift;
  };

  employees = (function () {
    var get_db, get_employee, clear_db, update_employee;

    get_db = function () {
      return stateMap.employee_db;
    };

    get_employee = function ( employee_map ) {
      var employee;

      employee = stateMap.employee_db({ id : employee_map.id }).first();

      if ( ! employee ) {
        employee = makeEmployee({ name : employee_map.name, id : employee_map.id });
      }
      return employee;
    };

    update_employee = function ( employee_id, update_map ) {

      stateMap.employee_db({ id : employee_id }).update( function () {
      var attribute = update_map[0],
        new_value   = update_map[1];
      
      this[ attribute ] =Math.round( (new_value + ( this[attribute] || 0) ) * 100 ) / 100;
      return this;
      });
    };

    clear_db = function () {
      stateMap.employee_db   = TAFFY();
    };

    return {
      update_employee : update_employee,
      clear_db : clear_db,
      get_db : get_db,
      get_employee : get_employee
    };
  }());

  accounts = (function () {
    var get_db, clear_db, update_account;

    get_db = function () {
      return stateMap.account_db;
    };

    clear_db = function () {
      stateMap.account_db   = TAFFY();
      stateMap.account_cid = 0;
    };

    update_account = function ( account_id, update_map ) {
      var attribute = update_map[0],
        new_value   = update_map[1];

      stateMap.account_db({ id : account_id }).update( attribute, new_value );
    };

    return {
      update_account : update_account,
      clear_db : clear_db,
      get_db : get_db
    };
  }());

  return {
    makeShift       : makeShift,  
    makeEmployee    : makeEmployee,
    employees       : employees,
    accounts        : accounts
  };
}());
