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
            + '<div class="sol-shell-main-file"></div>'
            + '<div class="sol-shell-main-list"></div>'
        + '</div>'
        + '<div class="sol-shell-foot">'
        + '</div>'
    },
    stateMap = {
      $container : undefined
    },
    jqueryMap = {},

    setJqueryMap, initModule, onLogoClick;
    
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container : $container,
      $file            : $container.find('.sol-shell-main-file'),
      $list            : $container.find('.sol-shell-main-list'),
      $logo            : $container.find('.sol-shell-head-logo')
    };
  };

  initModule = function ( $container ) {
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    jqueryMap.$logo
      .bind('click', onLogoClick);

    sol.file.initModule( jqueryMap.$file );
    sol.list.initModule( jqueryMap.$list );
    sol.model.shifts.clear_db();
    sol.model.employees.clear_db();
  };

  onLogoClick = function () {
    initModule( stateMap.$container );
  };

  return { initModule : initModule };
}());
