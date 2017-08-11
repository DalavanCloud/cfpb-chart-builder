'use strict';

require( 'core-js/es6/symbol' );
require( 'core-js/es6/promise' );
require( 'core-js/fn/array/index-of' );

var documentReady = require( './utils/document-ready' );
var createChart = require( './charts' );
var process = require( './utils/process-json' );
var ajax = require( './utils/get-data' );

var errorStrings = {
  parseError: 'There was an error parsing the data as JSON',
  groupError: 'There was an error finding the group in data properties',
  propertyError: 'There was an error finding the adjusted and/or unadjusted properties in the data'
};

/***
* When the document is ready, the code for cfpb-chart-builder seeks out chart
* blocks and generates charts inside the designated elements.
*/
documentReady( function() {
  _createCharts();
} );

function _createChart( { el, title, type, color, metadata, source } ) {

  return ajax( source ).then( data => new Promise( function( resolve, reject ) {

    var chart;

    if ( type === 'line-comparison' ) {
      data = process.delinquencies( data, metadata );
      chart = createChart.lineComparison( { el, type, color, data } );
    }

    if ( type === 'line' ) {
      data = process.originations( data[0], metadata );
      if ( typeof data === 'object' ) {
        chart = createChart.line( { el, type, color, data } );
      } else {
        chart.setAttribute( 'data-chart-error', errorStrings[data] );
        console.log( errorStrings[data] );
      }
    }

    if ( type === 'bar' ) {
      data = process.yoy( data[0], metadata );
      if ( typeof data === 'object' ) {
        chart = createChart.bar( { el, type, color, data } );
      } else {
        chart.setAttribute( 'data-chart-error', errorStrings[data] );
        console.log( errorStrings[data] );
      }
    }

    if ( type === 'tile_map' ) {
      data = process.map( data[0], metadata );
      if ( typeof data === 'object' ) {
        chart = createChart.tileMap( { el, type, color, data } );
      } else {
        chart.setAttribute( 'data-chart-error', errorStrings[data] );
        console.log( errorStrings[data] );
      }
    }

    resolve( chart );

  } ) );

}

function _createCharts() {

  var charts = document.querySelectorAll( '.cfpb-chart' );

  for ( var chart of charts ) {
    _createChart( {
      el: chart,
      title: chart.getAttribute( 'data-chart-title' ),
      type: chart.getAttribute( 'data-chart-type' ),
      color: chart.getAttribute( 'data-chart-color' ),
      metadata: chart.getAttribute( 'data-chart-metadata' ),
      source: chart.getAttribute( 'data-chart-source' )
    } );
  }

}

var charts = {
  createChart: _createChart,
  createCharts: _createCharts
};

module.exports = charts;
