/*global TAFFY, $, sol, FileReader, alert */

sol.csv_handler = (function (){
  var
    splitLine, makeDateFromString, hourToString, shiftEndIsEarlierThanStart,
    changeToMilliseconds, makeDateFromShiftStartOrEnd, readCsvFile,
    addOneDayToShiftEndIfMidnightShift, checkIfLineContainsWrongInput;
  
  makeDateFromString = function ( date_to_parse ) {
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

  makeDateFromShiftStartOrEnd = function ( date, hour_to_parse ) {
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

  shiftEndIsEarlierThanStart = function ( starting_hour, ending_hour ) {
    if ( ending_hour < starting_hour ) {
      return true;
    }
    return false;
  };

  addOneDayToShiftEndIfMidnightShift = function (shift_start, shift_end ) {
    var start_parts, end_parts, starting_hour, ending_hour, ending_minute;

    start_parts = shift_start.split( ':' );
    end_parts   = shift_end.split( ':' );

    starting_hour   = parseInt( start_parts[0], 10 );
    ending_hour     = parseInt( end_parts[0], 10 );
    ending_minute  = parseInt( end_parts[1], 10 );

    if ( shiftEndIsEarlierThanStart( starting_hour, ending_hour ) ) {
      ending_hour += 24;
    }

    return hourToString( ending_hour, ending_minute );
    
  };

  checkIfLineContainsWrongInput = function( line_parts ) {
    var
      employee_id           = line_parts[1],
      date_to_parse         = line_parts[2],
      shift_start_to_parse  = line_parts[3],
      shift_end_to_parse    = line_parts[4],
      date_parts, shift_start_parts, shift_end_parts, i;

      date_parts        = date_to_parse.split( '.' );
      shift_start_parts = shift_start_to_parse.split( ':' );
      shift_end_parts   = shift_end_to_parse.split( ':' );

    if ( isNaN( parseInt( employee_id, 10 ) ) ) {
      return true;
    }
    for ( i = 0; i < date_parts.length; i++ ) {
      if ( isNaN( parseInt( date_parts[i], 10 ) ) ) {
        return true;
      }
    }
    for ( i = 0; i < shift_start_parts.length; i++ ) {
      if ( isNaN( parseInt( shift_start_parts[i], 10 ) ) ) {
        return true;
      }
    }
    for ( i = 0; i < shift_end_parts.length; i++ ) {
      if ( isNaN( parseInt( shift_end_parts[i], 10 ) ) ) {
        return true;
      }
    }
    return false;
  };

  splitLine = function ( line ) {
    var
      employee, shift_line_parts, employee_name, employee_id, date_to_parse,
      shift_start, shift_end, shift_start_to_parse, shift_end_to_parse, date,
      shift;

    shift_line_parts = line.split( ',' );
    if (shift_line_parts.length < 5 ) {
      alert('File contains badly formatted line');
    }
    if ( checkIfLineContainsWrongInput( shift_line_parts ) ) {
      alert('File contains a bad line');
    }

    employee_name         = shift_line_parts[0];
    employee_id           = parseInt( shift_line_parts[1], 10 );
    date_to_parse         = shift_line_parts[2];
    shift_start_to_parse  = shift_line_parts[3];
    shift_end_to_parse    = shift_line_parts[4];
    
    employee = sol.model.employees.get_employee({
      id : employee_id,
      name : employee_name 
    });

    shift_end_to_parse = addOneDayToShiftEndIfMidnightShift(
      shift_start_to_parse, shift_end_to_parse );
    
    date        = makeDateFromString( date_to_parse );
    shift_start = makeDateFromShiftStartOrEnd( date, shift_start_to_parse );
    shift_end   = makeDateFromShiftStartOrEnd( date, shift_end_to_parse );

    shift = {
      employee    : employee,
      date        : date,
      date_start  : shift_start,
      date_end    : shift_end 
    };

    sol.model.makeShift( shift );
    return shift;
  };

  readCsvFile = function ( evt, callback ) {
    var files,
      reader = new FileReader(),
      lines, line, file;

    if ( evt.target.files ){
      files = evt.target.files;
    } else {
      files = evt.originalEvent.dataTransfer.files;
    }
    file = files[0];

    if ( ! file ) {
      alert("Failed to load file");
    }

    reader.onload = function() {
      lines = this.result.split('\n');
      if ( lines.length < 2 ) {
        alert('csv must be formatted with newlines!');
      }
      for( line = 1; line < lines.length; line++ ){
        if (lines[line].length > 0 ) {
          splitLine( lines[ line ] );
        }
      }
      callback();
    };
    reader.readAsText(file, "UTF-8");
  };
  
  return {
    readCsvFile : readCsvFile,
    splitLine : splitLine
  };
}());
