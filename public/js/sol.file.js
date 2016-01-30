/*global $, sol */
sol.file = (function () {
  'use strict';

  var
    configMap = {
      main_html : String()
          + '<div class="sol-shell-main-file-drop">'
            + '<div class="sol-shell-main-file-drop-header">Drop a .csv file here </div>'
              + '<div class="or">or</div>'
            + '<div class="sol-shell-main-file-regular">'
                + '<label>'
                  + '<div class="sol-shell-main-file-regular-header"> Select a .csv file </div>'
                  + '<input type="file" id="regular-input" name="files[]" multiple />'
                + '</label>'
            + '</div>'
          + '</div>'
    },
    stateMap = {
      $container : undefined
    },
    jqueryMap = {},

    setJqueryMap, onFileInput,
    onDragOver,   onDragLeave,
    initModule;
    
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
    try {
      sol.csv_handler.readCsvFile( event, sol.salary_calculator.calculateAllWagesAndAddToDb );
      $(this).removeClass('dragover');
    } catch (e) {
    }
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
