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
    makeShift;

  makeEmployee = function ( employee_map ) {
    var employee = {},
      name = employee_map.name,
      id   = employee_map.id;

    employee.name = name;
    employee.id   = id;

    stateMap.employee_db.insert( employee );
    return employee;
  };

  makeShift = function ( shift_map ) {
    var shift = {},
      employee      = shift_map.employee,
      date          = shift_map.date,
      shift_start   = shift_map.date_start,
      shift_end     = shift_map.date_end;
    
    shift.employee_id = employee.id;
    shift.date        = date;
    shift.shift_start = shift_start;
    shift.shift_end   = shift_end;
    shift.id          = stateMap.account_cid++;

    stateMap.account_db.insert( shift );
    return shift;
  };

  employees = (function () {
    var get_db, get_employee, clear_db;

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

    clear_db = function () {
      stateMap.employee_db   = TAFFY();
    };

    return {
      clear_db : clear_db,
      get_db : get_db,
      get_employee : get_employee
    };
  }());

  accounts = (function () {
    var get_db, clear_db;

    get_db = function () {
      return stateMap.account_db;
    };

    clear_db = function () {
      stateMap.account_db   = TAFFY();
      stateMap.account_cid = 0;
    };

    return {
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
