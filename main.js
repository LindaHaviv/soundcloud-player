var xmlns = "http://www.w3.org/2000/svg",
  select = function(s) {
    return document.querySelector(s);
  },
  selectAll = function(s) {
    return document.querySelectorAll(s);
  },
  container = select('.container'),
  searchSVG = select('.searchSVG'),
  vinylSVG = select('.vinylSVG'),
  imageContainer = select('#image-container'),
  previewContainer = select('#preview-container'),
  circleDragger = select('#circleDragger'),
  vinylTitle = select('#vinylTitle'),
    scPlayer,
    vinylStartRotation = 31,
    vinylEndRotation = 53,
    vinylRotationScale = (vinylEndRotation - vinylStartRotation),
    trackDuration, stylusDragger, currentState, needle_down = new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/35984/vinyl_needle_down_edit.mp3');

//center the container cos it's pretty an' that
TweenMax.set('#search-box', {
  position: 'absolute',
  top: 30,
  left: '50%',
  xPercent: -50,
  yPercent: 0
})

//center the container cos it's pretty an' that
TweenMax.set(container, {
  position: 'absolute',
  top: '0%',
  left: '50%',
  xPercent: -50,
  yPercent: 0
})
TweenMax.set('svg', {
  visibility:'visible'
})
TweenMax.set(vinylSVG, {  
  y:-110,
  x:80
})

TweenMax.set(searchSVG, {
  //top: '50%',
  x:190,
  y:120,
  //yPercent: -50,
  scale:1.3
})

TweenMax.set('#searchIcon circle', {
  stroke:'#FFF'
})

TweenMax.set('#searchIcon path', {
  fill:'#FFF'
})

TweenMax.set('#scLogo', {
  x:23,
  y:23,
  scale:1
})


SC.initialize({
    client_id: '516b790a82b7c6d89856376fa4ced361',
    redirect_uri: 'https://storymore.com/soundcloud/'
  });


function getTracks(query){
  
    if(!query){
      
      return;
    }
  
   SC.get('/tracks', {
    q: query, limit:10
  }).then(function(tracks) {
    createTracks(tracks);
    //console.log()
    streamTrack(null, tracks[0])

  });

    TweenMax.set('#preview-container', {
      visibility:'visible'
    })    
    
    TweenMax.set('#search-box', {
      visibility:'hidden'
    })
    TweenMax.set('#searchIconGroup', {
      visibility:'visible'
    })       
    
    tl.play(0);
    
  TweenMax.to(searchSVG, 1, {
    x:-400,
    y:-10,
    scale:1,
    transformOrigin:'50% 50%',
    ease:Power3.easeInOut
  })
  
  TweenMax.to('#searchIcon circle',1, {
    stroke:'#FF5F00'
  })  
  TweenMax.to('#searchIcon path',1, {
    fill:'#FF5F00'
  })
  
  TweenMax.set('.scLogo', {
    autoAlpha:0
  })  
}


TweenMax.set(['#vinylShine1', '#vinylShine2', '#vinylShine3'], {
  drawSVG:'30% 30%'
})
TweenMax.set('#armGroup',  {
  //rotation:33,
  svgOrigin:'396.5 188'
})

TweenMax.set([ circleDragger], {
  svgOrigin:'396.5 188'
})

TweenMax.set('#vinylShineGroup', {
  //svgOrigin:'284 320'
  transformOrigin:'50% 50%'
})

var tl = new TimelineMax({paused:true});
tl.fromTo('#arm', 1, {
  drawSVG:'0% 0%'
}, {
  drawSVG:'0% 13%',
  ease:Power1.easeOut
})
.from('#balance', 1, {
  attr:{
    r:0
  },
  ease:Anticipate.easeIn
},'-=1')
.to('#arm', 2, {
  drawSVG:'0% 100%',
  ease:Power4.easeInOut
},'-=0.5')
.from('#stylus', 1, {
  scale:0,
  transformOrigin:'75% 15%',
  ease:Power2.easeInOut
},'-=0.9')
.staggerFrom('#vinylGroup circle', 2, {
  //x:'-=100',
  attr:{
    r:0
  },
  ease:Elastic.easeOut.config(1, 0.82)
},0.46,'-=0.6')
.from('#titleGroup', 0.5, {
  scale:0.8,
  alpha:0,
  //rotation:-45,
  transformOrigin:'50% 50%'//,
  //ease:Elastic.easeOut.config(1, 0.82)
},'-=2.6')

tl.timeScale(1.2);

var vinylShineTl = new TimelineMax({paused:true});
vinylShineTl.to(['#vinylShine1', '#vinylShine2', '#vinylShine3'], 1.4, {
  drawSVG:'65% 78%',
  ease:Linear.easeNone
})
.to(['#vinylShineGroup'], 3.3, {
  rotation:'+=360',
  repeat:-1,
  yoyo:false,
  transformOrigin:'50% 50%',
  ease:Linear.easeNone
},'-=1.4');




function onDrag(e){
  
  TweenMax.set('#armGroup', {
    rotation:circleDragger._gsTransform.rotation
  })
}

function onPress(){
  
  if(trackDuration){
    scPlayer.pause();
    setSylusHold();   
    needle_down.pause();
    needle_down.currentTime = 0;
    
  }

}


function onRelease(e){
  
  //return stylus to off position
  if(circleDragger._gsTransform.rotation < vinylStartRotation){
    
    TweenMax.to(['#armGroup'], 0.3,{
      rotation:0,
      ease:Back.easeOut.config(0.6)
    })       
    TweenMax.set(circleDragger,{
      rotation:0
    })   
    
    stopVinyl(); 
    
    scPlayer.pause();
    
    setSylusDropped();
    
    return;
    
  }
  
  console.log(scPlayer.currentTime())
  needle_down.play()
  if(scPlayer.currentTime() > 0){
    
    needle_down.play();
    //needle_down.loop = true;
    
    var headDragPercent = ((circleDragger._gsTransform.rotation - vinylStartRotation)/vinylRotationScale);
    
    console.log("headDragPercent: " + (headDragPercent * trackDuration) );
    scPlayer.play();
    scPlayer.seek(headDragPercent * trackDuration);
    playVinyl();
    setSylusDropped();
  
    return;
    
  }
  //console.log(circleDragger._gsTransform.rotation)
  //put the needle on the reckid  
  if(circleDragger._gsTransform.rotation >= vinylStartRotation){
    
    needle_down.play();
    //needle_down.loop = true;
    scPlayer.play();
    
    TweenMax.to('#armGroup', 0.3,{
      rotation:vinylStartRotation,
      ease:Back.easeOut.config(0.6)
    })
 
    TweenMax.set(circleDragger, {
      rotation:vinylStartRotation
    })   
    
    playVinyl();
    
    setSylusDropped();
    
  } 
    stylusDragger[0].vars.bounds.max = vinylEndRotation;
    stylusDragger[0].applyBounds();    
 
}

function setSylusDropped(){
  
    TweenMax.to('#armGroup', 0.2,{
      scaleY:1,
      ease:Back.easeOut.config(2)
    })   
}

function setSylusHold(){
  
    TweenMax.to('#armGroup', 0.2,{
      scaleY:0.98,
      ease:Back.easeOut.config(0.3)
    })   
}

function playVinyl(){
  //console.log(playTrackTl.duration())
  //
  //console.log(vinylShineTl.paused())
  if(vinylShineTl.paused()){
    vinylShineTl.resume();
    
    
  } else {
    
  }
  

}


function stopVinyl(){
  
  vinylShineTl.pause();
  TweenMax.to(['#vinylShine1', '#vinylShine2', '#vinylShine3'], 1, {
    drawSVG:'100% 100%',
    ease:Linear.easeNone,
    onComplete:function(){
      //vinylShineTl.pause(0);
      TweenMax.set(['#vinylShine1', '#vinylShine2', '#vinylShine3'], {
      drawSVG:'30% 30%'
      })
    }
})
  TweenMax.to(['#vinylShineGroup'], 1, {
    rotation:'+=45',
    ease:Power1.easeOut
  })  
  
  needle_down.pause();
  needle_down.currentTime = 0;
}

function endTrack(e){
  //alert('endTrack')
  TweenMax.to([circleDragger, '#armGroup'], 2, {
    rotation:0,
    ease:Back.easeOut.config(0.3)
  })
  
  stopVinyl();

}

function updateDragger(){
  var trackTimePercent = scPlayer.currentTime()/trackDuration;
  TweenMax.set([circleDragger, '#armGroup'], {
    rotation:vinylStartRotation + ((trackTimePercent * vinylRotationScale)),
    ease:Linear.easeNone
  })
}

function createTracks(tracks){
  
  for(var i = 0; i < tracks.length; i++){
     //console.log(tracks[i].title)
    var img = document.createElement('img');
    var a = document.createElement('a');
    img.className = 'thumb';
    if(tracks[i].artwork_url){
      img.setAttribute('src', tracks[i].artwork_url);
    } else{
       img.setAttribute('src', tracks[i].user.avatar_url);
     
    }
    
    img.setAttribute('title', tracks[i].title);
    img.setAttribute('width', 70);
    img.setAttribute('height', 70);
    img.trackInfo = tracks[i];
    a.setAttribute('href', '#');
    a.appendChild(img);
    imageContainer.appendChild(a);
    

    
  }   
  
  TweenMax.staggerFrom('#image-container img' , 1, {
      scale:0,
    delay:1.5,
    borderRadius:'50%',
      transformOrigin:'50% 50%'
    },0.1)
}

function streamTrack(e, trackInfo){
 
  SC.stream('/tracks/' + trackInfo.id).then(function(player){
    //player.play();
if (player.options.protocols[0] === 'rtmp') {
        player.options.protocols.splice(0, 1);
    }    
    scPlayer = player;  
     console.log(player)
    //console.log(trackInfo.permalink_url)
    vinylTitle.textContent = trackInfo.title;
    select('#preview-container a').href = trackInfo.permalink_url;
    select('#preview-container a').title = trackInfo.title;
    select('#preview-container a').alt = trackInfo.title;
    select('#preview-container img').src = (trackInfo.artwork_url) ? trackInfo.artwork_url  : trackInfo.user.avatar_url 
    select('#preview-container p').innerHTML = trackInfo.title;
  
    trackDuration = scPlayer.options.duration;
    player.on('time', function (){
      updateDragger();

    })
      player.on('finish', function (){
        endTrack()
    })
      player.on('state-change', function (state){
        currentState = state;
        console.log(state);
        
        if(state === "idle"){
          
          //needle_down.play()
        }
    })

  });  
    stylusDragger[0].vars.bounds.max = vinylStartRotation;
    stylusDragger[0].applyBounds();   
}

document.body.addEventListener('click', function(e){
  
  var t = e.target;
  console.log(trackDuration)
  if(!trackDuration){
    
    //return
  }
  //console.log(e.target.className === 'thumb')
  if(t.className === 'thumb'){
    //stylusDragger();
    scPlayer.pause();
    //setSylusHold();   
    stopVinyl();
    endTrack();
         
    streamTrack(e, t.trackInfo)
   console.log(e)
    console.log(t)
  }
  
  //console.log(t.id)
  if(t.id === "show"){
     
    //console.log(select('#search-field').value)
    select('#preview-container p').innerHTML = "";
    select('#preview-container img').src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/35984/blank.png";
    select('#image-container').innerHTML = "";
    select('#search-field').value = "";
    select('#search-field').focus();
    TweenMax.set('#search-box', {
      visibility:'visible'
    })    
    TweenMax.set('#preview-container', {
      visibility:'hidden'
    })
  TweenMax.to(searchSVG, 1, {
    x:190,
    y:120,
    scale:1,
    transformOrigin:'50% 50%',
    ease:Power3.easeInOut
  })
  
  TweenMax.to('#searchIcon circle',1, {
    stroke:'#FFF'
  })  
  TweenMax.to('#searchIcon path',1, {
    fill:'#FFF'
  })    
  
    scPlayer.pause();
    tl.time(0);
    tl.pause();
    vinylShineTl.time(0)    ;
    vinylShineTl.pause();
    needle_down.pause();
    needle_down.currentTime = 0;
    select('#search-field').focus();

    t.id="go"
  TweenMax.set('.scLogo', {
    autoAlpha:1
  })      
    return;
  }    
  
  if(t.id === "go"){
    
    console.log(select('#search-field').value)
    getTracks(select('#search-field').value);
    
    t.id="show"
    return;
  }  
  

/*  if(t.id === "searchIconGroup"){
    
    //console.log(select('#search-field').value)
    TweenMax.set('#search-box', {
      visibility:'visible'
    })
    TweenMax.set('#searchIconGroup', {
      visibility:'hidden'
    })    
  }*/
})

function createDragger(){
  
  stylusDragger = null;
  
  stylusDragger = Draggable.create(circleDragger,{
    type:'rotation',
    trigger:'#dragger',
    cursor:'pointer',
    bounds:{min:0,max:vinylStartRotation},
    onDrag:onDrag,
    onRelease:onRelease,
    onPress:onPress,
    
  })  
}

document.body.onkeypress = function(e){
  
  if(e.charCode === 13){
    
    getTracks(select('#search-field').value);
    select('#go').id="show";
  }
}
//select('#search-field').focus();
createDragger();
//ScrubGSAPTimeline(tl)