/*global TAFFY, $, sol */

sol.csv_handler = (function (){
  var
    splitLine, makeDate, hourToString, shiftEndsAfterMidnight,
    changeToMilliseconds, makeShiftDateWithHour,
    addOneDayToShiftEndIfAfterMidnight;
  
  makeDate = function ( date_to_parse ) {
    var date_parts, day, year, month;

    date_parts = date_to_parse.split( '.' );

    day = parseInt( date_parts[0], 10 );
    month = parseInt( date_parts[1], 10 );
    year = parseInt( date_parts[2], 10 );

    return new Date( year, month, day );
  };

  changeToMilliseconds = function ( hour, minutes ) {
    return hour*60*60*1000 + minutes*60*1000;
  };

  makeShiftDateWithHour = function ( date, hour_to_parse ) {
    var time_parts, hour, minutes, milliseconds;

    time_parts = hour_to_parse.split( ':' );

    hour = parseInt( time_parts[0], 10 );
    minutes = parseInt( time_parts[1], 10 );

    milliseconds = changeToMilliseconds( hour, minutes );
    return new Date( date.getTime() + milliseconds );
  };

  hourToString = function ( hour, minute ) {
    return hour + ':' + minute;
  };

  shiftEndsAfterMidnight = function ( starting_hour, ending_hour ) {
    if ( ending_hour < starting_hour ) {
      return true;
    }
    return false;
  };

  addOneDayToShiftEndIfAfterMidnight = function (shift_start, shift_end ) {
    var start_parts, end_parts, starting_hour, ending_hour, ending_minute;

    start_parts = shift_start.split( ':' );
    end_parts   = shift_end.split( ':' );

    starting_hour   = parseInt( start_parts[0], 10 );
    ending_hour     = parseInt( end_parts[0], 10 );
    ending_minute  = parseInt( end_parts[1], 10 );

    if ( shiftEndsAfterMidnight( starting_hour, ending_hour ) ) {
      ending_hour += 24;
    }

    return hourToString( ending_hour, ending_minute );
    
  };

  splitLine = function ( line ) {
    var
      employee, shift_line_parts, employee_name, employee_id, date_to_parse,
      shift_start, shift_end, shift_start_to_parse, shift_end_to_parse, date,
      shift;

    shift_line_parts = line.split( ',' );

    employee_name         = shift_line_parts[0];
    employee_id           = parseInt( shift_line_parts[1], 10 );
    date_to_parse         = shift_line_parts[2];
    shift_start_to_parse  = shift_line_parts[3];
    shift_end_to_parse    = shift_line_parts[4];
    
    employee = sol.model.employees.get_employee({
      id : employee_id,
      name : employee_name 
    });

    shift_end_to_parse = addOneDayToShiftEndIfAfterMidnight(
      shift_start_to_parse, shift_end_to_parse );
    
    date        = makeDate( date_to_parse );
    shift_start = makeShiftDateWithHour( date, shift_start_to_parse );
    shift_end   = makeShiftDateWithHour( date, shift_end_to_parse );

    shift = {
      employee    : employee,
      date        : date,
      date_start  : shift_start,
      date_end    : shift_end 
    };

    sol.model.makeShift( shift );
    return shift;
  };
  
  return {
    splitLine : splitLine
  };
}());
