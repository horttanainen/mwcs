/*global $, sol */

sol.shell = (function () {
  'use strict';

  var
    configMap = {
      main_html : String()
        + '<div class="sol-shell-head">'
          + '<div class="sol-shell-head-logo">'
            + '<h1>AWESOME</h1>'
            + '<p>Monthly Wage Calculation System</p>'
          + '</div>'
        + '</div>'
        + '<div class="sol-shell-main">'
            + '<div class="sol-shell-main-file">'
            + '<p>drop a file</p>'
                + '<div class="sol-shell-main-file-drop">'
                  + 'Drop a CSV file here'
                + '</div>'
                + '<div class="sol-shell-main-file-regular">'
                + '<input type="file" id="regular-input" name="files[]" multiple />'
                + '</div>'
            + '</div>'
            + '<div class="sol-shell-main-list"></div>'
        + '</div>'
        + '<div class="sol-shell-foot">'
        + '</div>'
    },
    stateMap = {
      $container : undefined
    },
    jqueryMap = {},

    initModule, setJqueryMap, onFileInput, onDragOver, onDragLeave;
    
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container : $container,
      $regular_input   : $container.find('#regular-input'),
      $drop_input      : $container.find('.sol-shell-main-file-drop')
    };
  };

  onFileInput = function ( event ) {
    event.stopPropagation();
    event.preventDefault();
    sol.csv_handler.readCsvFile( event, sol.salary_calculator.calculateAllWagesAndAddToDb );
  };

  onDragOver = function ( event ) {
    event.stopPropagation();
    event.preventDefault();
    event.originalEvent.dataTransfer.dropEffect = 'copy';
    $(this).addClass('dragover');
  };

  onDragLeave = function ( event ) {
    event.preventDefault();  
    event.stopPropagation();
    $(this).removeClass('dragover');
  };

  initModule = function ( $container ) {
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    jqueryMap.$regular_input
      .bind('change', onFileInput );

    jqueryMap.$drop_input
      .bind('dragover', onDragOver );

    jqueryMap.$drop_input
      .bind('dragleave', onDragLeave);

    jqueryMap.$drop_input
      .bind('drop', onFileInput );
  };

  return { initModule : initModule };
}());
