/*global $, sol */
sol.salary_calculator = (function (){
  'use strict';
  var
    configMap = {
      regular_wage          : 3.75,
      evening_compensation  : 1.15,
      evening               : 18,
      morning               : 6,
      nextday_morning       : 24 + 6,
      nextday_evening       : 24 + 18,
      overtime_compensation_percents : {
        first_two   : 0.25,
        two_to_four : 0.5,
        after_four  : 1
      }
    },

    totalPayForShift, eveningCompensationForShift, overtimeCompensationForShift,
    eveningHoursInShift, totalHoursInShift, hoursBeforeEveningInShift,
    hoursAfterMorningInShift, sumOvertimeCompensationsTogether, regularDailyWageForShift,
    compensationForTimeIntervalWithPercent, roundToTwoDecimals, 
    calculateAllWagesAndAddToDb;

    roundToTwoDecimals = function ( number ) {
      return Math.round( number * 100 ) / 100;
    };

    hoursAfterMorningInShift = function ( shift ) {
      var evening_end_in_hours  = 24 + 6,
        evening_start_in_hours  = 24 + 18,
        hour_in_milliseconds    = 60*60*1000,
        shift_end_in_hours, hours_after_evening_start,
        hours_after_evening;

        shift_end_in_hours  = (shift.shift_end.getTime() - shift.date.getTime()) / hour_in_milliseconds;
        hours_after_evening = shift_end_in_hours - evening_end_in_hours;
        hours_after_evening_start  = shift_end_in_hours - evening_start_in_hours;

        if ( hours_after_evening_start > 0) {
          hours_after_evening -= hours_after_evening_start; 
        }

        if (hours_after_evening <= 0 ) {
          return 0;
        }
        return hours_after_evening;
    };

    hoursBeforeEveningInShift = function ( shift ) {
      var evening_start_in_hours = 18,
        evening_end_in_hours = 6,
        hour_in_milliseconds = 60*60*1000,
        shift_start_in_hours, hours_before_evening_end,
        hours_before_evening, shift_end_in_hours;

      shift_start_in_hours = (shift.shift_start.getTime() - shift.date.getTime()) / hour_in_milliseconds;
      shift_end_in_hours = (shift.shift_end.getTime() - shift.date.getTime()) / hour_in_milliseconds;
      hours_before_evening = Math.min(evening_start_in_hours, shift_end_in_hours ) - shift_start_in_hours;
      hours_before_evening_end   = evening_end_in_hours - shift_start_in_hours;

      if ( hours_before_evening_end > 0) {
        hours_before_evening -= hours_before_evening_end;
      }

      if ( hours_before_evening <= 0) {
        return 0;
      }
      return hours_before_evening;
    };

    totalHoursInShift = function ( shift ) {
      var shift_total_hours, 
        hour_in_milliseconds = 60*60*1000;

      shift_total_hours = (shift.shift_end.getTime() - shift.shift_start.getTime()) / hour_in_milliseconds;
      return roundToTwoDecimals( shift_total_hours );
    };

    eveningHoursInShift = function ( shift ) {
      var shift_total_hours, hours_before_evening, hours_after_evening,
        evening_hours;

      shift_total_hours     = totalHoursInShift( shift );
      hours_before_evening  = hoursBeforeEveningInShift( shift );
      hours_after_evening   = hoursAfterMorningInShift( shift );

      evening_hours = shift_total_hours - hours_before_evening - hours_after_evening;

      sol.model.employees.update_employee( shift.employee_id, ['evening_hours', evening_hours] );
      sol.model.accounts.update_account( shift.id, ['evening_hours', evening_hours ]);
      return roundToTwoDecimals( evening_hours );
    };

    eveningCompensationForShift = function ( shift ) {
      var evening_hours;
      
      evening_hours = eveningHoursInShift( shift );

      return evening_hours*configMap.evening_compensation;
    };

    compensationForTimeIntervalWithPercent = function ( time_interval, overtime_percent ) {
      var regular_wage = configMap.regular_wage;

      return regular_wage * overtime_percent * time_interval;
    };

    sumOvertimeCompensationsTogether = function ( overtime_length ) {
      var first_two   = configMap.overtime_compensation_percents.first_two,
        two_to_four   = configMap.overtime_compensation_percents.two_to_four,
        after_four    = configMap.overtime_compensation_percents.after_four,
        overtime_compensation = 0,
        time_interval;

      if (overtime_length <= 0) {
        return 0;
      }
      if ( overtime_length > 4 ) {
        time_interval = overtime_length - 4;
        overtime_compensation += compensationForTimeIntervalWithPercent(
          time_interval,
          after_four
        );
      }
      if ( overtime_length > 2 ) {
        time_interval = Math.min( 2, overtime_length - 2 );
        overtime_compensation += compensationForTimeIntervalWithPercent(
          time_interval,
          two_to_four
        );
      }
      if ( overtime_length > 0 ) {
        time_interval = Math.min( 2, overtime_length );
        overtime_compensation += compensationForTimeIntervalWithPercent(
          time_interval,
          first_two
        );
      }
      return overtime_compensation;
    };

    overtimeCompensationForShift = function ( shift ) {
      var overtime_in_hours, shift_total_hours;

      shift_total_hours = totalHoursInShift( shift );
      overtime_in_hours = Math.max( shift_total_hours - 8, 0 );

      sol.model.employees.update_employee( shift.employee_id, ['overtime_hours' , overtime_in_hours] );
      sol.model.accounts.update_account( shift.id, ['overtime_hours', overtime_in_hours ]);
      return sumOvertimeCompensationsTogether( overtime_in_hours );
    };

    regularDailyWageForShift = function ( shift ) {
      var regular_hours = Math.min( 8, totalHoursInShift( shift ) );

      sol.model.employees.update_employee( shift.employee_id, ['regular_hours' , regular_hours] );
      sol.model.accounts.update_account( shift.id, ['regular_hours', regular_hours ]);
      return configMap.regular_wage * regular_hours;
    };

    totalPayForShift = function ( shift ) {
      var regular_daily_wage, evening_compensation, overtime_compensation, total_pay;

      regular_daily_wage    = regularDailyWageForShift( shift );
      evening_compensation  = eveningCompensationForShift( shift );
      overtime_compensation = overtimeCompensationForShift( shift );
      total_pay = roundToTwoDecimals( regular_daily_wage + evening_compensation + overtime_compensation );
      
      sol.model.employees.update_employee( shift.employee_id, ['regular_earn' , regular_daily_wage] );
      sol.model.accounts.update_account( shift.id, ['regular_earn', regular_daily_wage ]);
      sol.model.employees.update_employee( shift.employee_id, ['evening_earn' , evening_compensation] );
      sol.model.accounts.update_account( shift.id, ['evening_earn', evening_compensation ]);
      sol.model.employees.update_employee( shift.employee_id, ['overtime_earn' , overtime_compensation] );
      sol.model.accounts.update_account( shift.id, ['overtime_earn', overtime_compensation ]);
      return total_pay;
    };

    calculateAllWagesAndAddToDb = function () {
      var shift_db = sol.model.accounts.get_db(),
        shifts, i, total_pay, shift;

      shifts = shift_db().get();

      for ( i = 0; i < shifts.length; i++ ) {
        shift = shifts[ i ];
        total_pay = totalPayForShift( shift );
        sol.model.employees.update_employee( shift.employee_id, ['total_earn', total_pay] );
        sol.model.accounts.update_account( shift.id, ['total_earn', total_pay ]);
      }
    };

    return {
      overtimeCompensationForShift  : overtimeCompensationForShift,
      eveningHoursInShift : eveningHoursInShift,
      totalPayForShift : totalPayForShift,
      calculateAllWagesAndAddToDb : calculateAllWagesAndAddToDb
    };
}());
