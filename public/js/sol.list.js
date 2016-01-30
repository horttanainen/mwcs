/*global $, sol */
sol.list =(function (){
  'use strict';

  var
    configMap = {
      main_html : String()
        + '<ul class="sol-shell-main-list-employees"></ul>'
    },
    stateMap = {
      $container : undefined
    },
    jqueryMap = {},

    initModule, setJqueryMap, listEmployees, listFakeData,
    onListElementClick, populateListWithEmployeeStatistics,
    populateContainerWithEmployeeHtml, revertToList;
    
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container : $container,
      $employees : $container.find('.sol-shell-main-list-employees')
    };
  };

  revertToList = function() {
    jqueryMap.$container.html( configMap.main_html );
    setJqueryMap();
    listEmployees();
    jqueryMap.$employees
      .bind( 'click', onListElementClick );
  };

  listEmployees = function () {
    var employees = sol.model.employees.get_db()().get(),
      i, employee, list_element;
    for ( i = 0; i < employees.length; i++ ) {
      employee = employees[ i ];
      list_element = '<li name="' + employee.id + '">' + employee.name +', $' +employee.total_earn + '<hr></li>';
      jqueryMap.$employees.append(list_element);
    }
  };
  populateContainerWithEmployeeHtml = function (employee) {
    jqueryMap.$container.html(
      String()
        + '<table class="sol-shell-main-list-employee-table">'
          + '<div class="sol-shell-main-list-employee-header">'
          + '<span>'+employee.name+'</span>' +' (ID '+ employee.id + ')'
          + '</div>'
        + '<tr>'
          + '<td>Evening Compensation</td>'
          + '<td>'+employee.evening_hours+'h'+'</td>'
          + '<td>'+'$'+employee.evening_earn+'</td>'
        + '</tr>'
        + '<tr>'
          + '<td>Overtime Compensation</td>'
          + '<td>'+ employee.overtime_hours+'h' +'</td>'
          + '<td>'+'$'+ employee.overtime_earn+'</td>'
        + '</tr>'
        + '<tr>'
          + '<td>Regular work</td>'
          + '<td>'+ employee.regular_hours+'h' +'</td>'
          + '<td>'+'$'+ employee.regular_earn+'</td>'
        + '</tr>'
        + '<tr>'
          + '<td>Total Pay</td>'
          + '<td>'+employee.total_hours+'h'+'</td>'
          + '<td>'+'$'+employee.total_earn+'</td>'
        + '</tr>'
        + '</table>'
        + '<div class="sol-shell-main-list-employee-back">Back to List</div>'
  );
  };

  populateListWithEmployeeStatistics = function ( employee_id ) {
    var employee_db, employee;
    employee_db = sol.model.employees.get_db();
    employee    = employee_db({ id : employee_id }).first();

    populateContainerWithEmployeeHtml( employee );
    $('.sol-shell-main-list-employee-back')
      .bind('click', revertToList );
  };

  onListElementClick = function ( event ) { 
    if (event.target.getAttribute('name')){
      populateListWithEmployeeStatistics( parseInt(event.target.getAttribute('name'), 10) );
    }
  };

  initModule = function ( $container ) {
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    $.gevent.subscribe( $container, 'db-update',  listEmployees );

    jqueryMap.$employees
      .bind( 'click', onListElementClick );
  };

  return {
          initModule : initModule 
        };
}());

