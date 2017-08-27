

(function (xhr) {




  var field,
      markers,
      showFoes,
      currCoords,
      showFoesField,
      gameCircleInner,
      mapOrigSettingsSet;





  if(navigator.geolocation){

    function setupMap(pos) {
      currCoords = pos; //save a reference of cur coords
      if(!mapOrigSettingsSet){setMapStyleSettings()}  // get / set map styles array
      
      

      modifyMapIfExistsOtherwiseCreate({
            zoom: 19,
            disableDefaultUI: true,
            center: {
              lat: currCoords.coords.latitude + (0.00014 * (2*((window.innerHeight-450)/(900-450))) - 0.00014), //currCoords.coords.latitude + 0.00014 (at 900px height device),
              lng: currCoords.coords.longitude
            }
        });

      finalizeMapInstance() // initialize event listeners on map and report coords


    };

     getPos = function(){navigator.geolocation.getCurrentPosition(setupMap);};


  }







  function modifyMapIfExistsOtherwiseCreate(settingsObj){

    if(!field){
      field = new google.maps.Map(document.getElementById('map'), settingsObj);
      field.set("styles", mapOrigSettingsSet);
    } else {
      field.setOptions(settingsObj)
    }
  }



  var setMapStyleSettings = function(){
    //set variable here so to not initialize large json array at script start
    mapOrigSettingsSet = [{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"hue":"#00ffe6"},{"saturation":-20}]}];
  };


  var removeLoader = function (){
    document.body.removeChild(document.getElementById('load-screen'));
  };

  var sendInitCoords = function(){
    sendAjaxReq({
     url: "/profile/locationfield/locate", 
     method: "POST",
     data: { latitude: currCoords.coords.latitude, longitude: currCoords.coords.longitude}
    });
  };


  var finalizeMapInstance = function(){
    sendInitCoords();
    // Determine whether google maps resize evt listener has been added through load screens existence because both only need occur on first initialize of the map but not subsequent. 
    if(document.getElementById('load-screen')){
      google.maps.event.addDomListener(window, "resize", function() {
         google.maps.event.trigger(field, "resize");
         field.setCenter({ lat: currCoords.coords.latitude + (0.00014 * (2*((window.innerHeight-450)/(900-450))) - 0.00014), lng: currCoords.coords.longitude });
         // shorten inner playing field radius in smaller height devices
         if(gameCircleInner){
            gameCircleInner.setRadius(adjInnerFieldRadius());
         }
      });

      removeLoader(); // remove load screen
    }
  };



  

  // make / create google maps circle template factory
  var newMapsTempForRadius = function (radius, isOuterField){
    
    var strkOpacity = 0.1,
        strkWght = 6,
        color = isOuterField ? "yellow" : "red";

    return {
      strokeColor: color,
      strokeOpacity: strkOpacity,
      strokeWeight: strkWght,
      fillColor: color,
      animation: google.maps.Animation.BOUNCE,
      map: field,
      center: {
        // lat: adjusts north south direction of circles this conditional is used so both the players
        // inner field radius and outer field radius can use the same circle templating function with 
        // the inner being lifted north of center
        lat: isOuterField ? currCoords.coords.latitude - 0.00095 : currCoords.coords.latitude - 0.00066, 
        lng: currCoords.coords.longitude
      },
      radius: radius
    }
  };


   var newMapsMarker = function(coordArr){
              for (var i = 0; i < coordArr.length; i++) {

                    var marker = new google.maps.Marker({
                    position: {lat: coordArr[i].location.coordinates[0], lng: coordArr[i].location.coordinates[1]}, map: field
                  });

                    markers.push(marker);
              } 
   };


   var getScanRadius = function() {
      if(!showFoesField){
        
        // the user or players outer field radius, following line is inner field radius
        var outerPersonalFieldRadius = newMapsTempForRadius(160, true);
        var innerPersonalFieldRadius = newMapsTempForRadius(adjInnerFieldRadius());

          // Attached inner and outer fields (game field/ radius) to google maps
          // if creating radius playing field for first time
          if(!gameCircleInner){
            gameCircleOuter = new google.maps.Circle(outerPersonalFieldRadius);
            gameCircleInner = new google.maps.Circle(innerPersonalFieldRadius);
          }
          // if radius playing fields already exist than just modify settings 
          else {
            gameCircleOuter.setOptions(outerPersonalFieldRadius);
            gameCircleInner.setOptions(innerPersonalFieldRadius);
          }
        showFoesField = true;
      }else{

        gameCircleOuter.setMap(null);
        gameCircleInner.setMap(null);

        showFoesField = false;
      }
   }



  var adjInnerFieldRadius = function (){
       if(window.innerWidth < 900){
          return 55;
       }else if(window.innerWidth < 1300){
          return 62;
       }else{
          return 72;
       }
  };

  var toggleMarkedOpponents = function(){

    if(markers.length && !showFoes){

            for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(field)
              console.log("attached to map?", markers[i].getMap())
            }


            showFoes = true;
            console.log("true", showFoes);
    }else if(markers.length && showFoes){

            for (var i = 0; i < markers.length; i++) {
              
              markers[i].setMap(null);
              console.log("removed from map?", markers[i].getMap())
            }


            
            showFoes = false;
            console.log("false", showFoes);

    }
          
  }


  var toggleDashboard = function(forcedScanState){
    showFoesField = forcedScanState;
    getScanRadius();
    showFoes = forcedScanState === false ? true : showFoes;
  }


  function addEventListeners(){
    document.getElementById('show-dashboard').onclick = function() {
        var dashboardOverlay = document.getElementById('dashbrd-overlay-display');

        if(dashboardOverlay.className === "hidden"){
          
          sendAjaxReq({url: "/profile/locationfield/scan", method: "GET"}, function(data){
              markers = [];
              console.log("markers", markers)
              newMapsMarker(data)
          })

          toggleDashboard(false);
          dashboardOverlay.className = "";
        }else{
          toggleDashboard(true);
          dashboardOverlay.className = "hidden";
        }
    }
  

    // reset orig zoom level state
    document.getElementById('reset-zoom').onclick = function(){
      field.setZoom(19);
    }

    // reposition map back to center
    document.getElementById('re-center').onclick = function(){
      field.setCenter({ lat: currCoords.coords.latitude + (0.00014 * (2*((window.innerHeight-450)/(900-450))) - 0.00014), lng: currCoords.coords.longitude });
    }

    document.getElementById('tog-markers').onclick = function(){
        toggleMarkedOpponents();
    }

    document.getElementById('tog-scanner').onclick = function(){
        getScanRadius();
    }


    // Not sure to keep: For testing purposes
    document.getElementById('show-btmbar').onclick = function() {
      var btmBar = document.getElementById('btmbar');
      if(btmBar.className === "hidden"){
        btmBar.className = "";
      }else{
        btmBar.className = "hidden";
      }
    }
  }







  window.setInterval(getPos, 30000);





  window.onload = function(){
    addEventListeners();
  };




  var sendAjaxReq = function(options, callback) { 
       window.XMLHttpRequest = xhr;
       if(callback){
        $.ajax(options).done(callback);
       }else{
        $.ajax(options)
       }
       
       window.XMLHttpRequest = null;
  };



}(window.XMLHttpRequest));


window.XMLHttpRequest = null;

