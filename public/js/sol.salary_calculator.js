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
      regular_day_length    : 8,
      overtime_compensation_percents : {
        first_two   : 0.25,
        two_to_four : 0.5,
        after_four  : 1
      }
    },
    roundToTwoDecimals,   updateShiftAndEmployee,   totalHours,
    hoursAfterMorning,    hoursBeforeEvening,       eveningHoursInShift,
    eveningCompensation,
    overtimeCompensationForTimeintervalWithPercent,
    sumOvertimeCompensationsTogether, overtimeCompensationForShift, 
    regularDailyWageForShift,         totalPayForShift, 
    calculateAllWagesAndAddToDb;

    roundToTwoDecimals = function ( number ) {
      return Math.round( (number + 0.00001) * 100 ) / 100;
    };
    
    updateShiftAndEmployee = function ( shift, update_map ) { 
      var
        employee_id = shift.employee_id,
        shift_id    = shift.id;

      sol.model.employees.update_employee( employee_id, update_map );
      sol.model.shifts.update_shift( shift_id, update_map );
    };

    totalHours = function ( shift ) {
      var shift_total_hours, 
        hour_in_milliseconds = 60*60*1000;

      shift_total_hours = (shift.shift_end.getTime() - shift.shift_start.getTime()) / hour_in_milliseconds;

      updateShiftAndEmployee( shift, ['total_hours', shift_total_hours ]);
      return roundToTwoDecimals( shift_total_hours );
    };

    hoursAfterMorning = function ( shift ) {
      var nextday_morning    = configMap.nextday_morning,
        nextday_evening      = configMap.nextday_evening,
        hour_in_milliseconds = 60*60*1000,
        shift_end_in_hours, hours_after_nextday_evening,
        hours_after_evening;

        shift_end_in_hours = (shift.shift_end.getTime() - shift.date.getTime()) / hour_in_milliseconds;

        hours_after_evening         = shift_end_in_hours - nextday_morning;
        hours_after_nextday_evening = shift_end_in_hours - nextday_evening;

        if ( hours_after_nextday_evening > 0) {
          hours_after_evening -= hours_after_nextday_evening; 
        }

        if (hours_after_evening <= 0 ) {
          return 0;
        }
        return hours_after_evening;
    };

    hoursBeforeEvening = function ( shift ) {
      var 
        evening               = configMap.evening,
        morning               = configMap.morning,
        hour_in_milliseconds  = 60*60*1000,
        shift_start_in_hours, hours_before_morning,
        hours_before_evening, shift_end_in_hours;

      shift_start_in_hours = (shift.shift_start.getTime() - shift.date.getTime()) / hour_in_milliseconds;
      shift_end_in_hours = (shift.shift_end.getTime() - shift.date.getTime()) / hour_in_milliseconds;
      hours_before_evening = Math.min(evening, shift_end_in_hours ) - shift_start_in_hours;
      hours_before_morning   = morning - shift_start_in_hours;

      if ( hours_before_morning > 0) {
        hours_before_evening -= hours_before_morning;
      }

      if ( hours_before_evening <= 0) {
        return 0;
      }
      return hours_before_evening;
    };

    eveningHoursInShift = function ( shift ) {
      var shift_total_hours, hours_before_evening, hours_after_evening,
        evening_hours;

      shift_total_hours     = totalHours( shift );
      hours_before_evening  = hoursBeforeEvening( shift );
      hours_after_evening   = hoursAfterMorning( shift );

      evening_hours = shift_total_hours - hours_before_evening - hours_after_evening;

      updateShiftAndEmployee( shift, ['evening_hours', evening_hours] );
      return roundToTwoDecimals( evening_hours );
    };

    eveningCompensation = function ( shift ) {
      var evening_hours;
      
      evening_hours = eveningHoursInShift( shift );

      return roundToTwoDecimals( evening_hours*configMap.evening_compensation );
    };

    overtimeCompensationForTimeintervalWithPercent = function ( time_interval, overtime_percent ) {
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
        overtime_compensation += overtimeCompensationForTimeintervalWithPercent(
          time_interval,
          after_four
        );
      }
      if ( overtime_length > 2 ) {
        time_interval = Math.min( 2, overtime_length - 2 );
        overtime_compensation += overtimeCompensationForTimeintervalWithPercent(
          time_interval,
          two_to_four
        );
      }
      if ( overtime_length > 0 ) {
        time_interval = Math.min( 2, overtime_length );
        overtime_compensation += overtimeCompensationForTimeintervalWithPercent(
          time_interval,
          first_two
        );
      }
      return overtime_compensation;
    };

    overtimeCompensationForShift = function ( shift ) {
      var overtime_in_hours, shift_total_hours;

      shift_total_hours = totalHours( shift );
      overtime_in_hours = Math.max( shift_total_hours - configMap.regular_day_length, 0 );

      updateShiftAndEmployee( shift, ['overtime_hours', overtime_in_hours ] );
      return roundToTwoDecimals(sumOvertimeCompensationsTogether( overtime_in_hours ));
    };

    regularDailyWageForShift = function ( shift ) {
      var regular_hours = Math.min( configMap.regular_day_length, totalHours( shift ) );

      updateShiftAndEmployee( shift, ['regular_hours', regular_hours ] );
      return roundToTwoDecimals(configMap.regular_wage * regular_hours);
    };

    totalPayForShift = function ( shift ) {
      var regular_daily_wage, evening_compensation, overtime_compensation, total_pay;

      regular_daily_wage    = regularDailyWageForShift( shift );
      evening_compensation  = eveningCompensation( shift );
      overtime_compensation = overtimeCompensationForShift( shift );
      total_pay = roundToTwoDecimals( regular_daily_wage + evening_compensation + overtime_compensation );
      
      updateShiftAndEmployee( shift, ['regular_earn' , regular_daily_wage] );
      updateShiftAndEmployee( shift, ['evening_earn' , evening_compensation] );
      updateShiftAndEmployee( shift, ['overtime_earn', overtime_compensation] );
      return total_pay;
    };

    calculateAllWagesAndAddToDb = function () {
      var
        shift_db = sol.model.shifts.get_db(),
        shifts, i, total_pay, shift;

      shifts = shift_db().get();

      for ( i = 0; i < shifts.length; i++ ) {
        shift = shifts[ i ];
        total_pay = totalPayForShift( shift );
        updateShiftAndEmployee( shift, ['total_earn', total_pay] );
      }
      $.gevent.publish( 'db-update' );
    };

    return {
      overtimeCompensationForShift  : overtimeCompensationForShift,
      eveningHoursInShift           : eveningHoursInShift,
      totalPayForShift              : totalPayForShift,
      calculateAllWagesAndAddToDb   : calculateAllWagesAndAddToDb
    };
}());
