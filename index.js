// var colors = require('colors');
var CANVAS_OBJECTS = []
var CANVAS_OBJECTS_IDS = -1;
CANVAS_OBJECTS_IDS_GET = function(){
  CANVAS_OBJECTS_IDS++;
  return CANVAS_OBJECTS_IDS
}
var CANVAS_INTERVAL_FUNCTIONS = [];
var CANVAS_INTERVAL = setInterval(function(){
  for (var i = 0; i < CANVAS_INTERVAL_FUNCTIONS.length; i++) {
    CANVAS_INTERVAL_FUNCTIONS[i].interval(CANVAS_INTERVAL_FUNCTIONS[i].parameter)
  }
},1000);

module.exports = {
  CanvasObjects: function(){
    co_self = this;
    co_self.GlobalID = CANVAS_OBJECTS_IDS_GET()
    co_self.gameType = "platform"; // plataform, fromAbove
    co_self._mapsimageTotals = -1
    co_self.imgs = Array();

    co_self.objectsByLayer = Array();

    co_self.focusEnabled = false;
    co_self.focusXEnabled = false;
    co_self.focusYEnabled = false;

    co_self.focusedObject = {};
    co_self.getAllObjects = function(){
      newObjectList = Array();
      for (var i = 0; i < this.objectsByLayer.length; i++) {
        newObjectList = newObjectList.concat(this.objectsByLayer[i])
      }
      return newObjectList;
     }

    co_self.createMap = function(name){
      that = this;
      that._mapsimageTotals++;
      cm_obj = {
        id : that._mapsimageTotals,
        type : "map",
        layer: 0,
        setLayer: function(v){
          if(typeof that.objectsByLayer[v] == "undefined") that.objectsByLayer[v] = Array();
          that.objectsByLayer[v][that.objectsByLayer[v].length] = this;
          that.removeFromLayers(this.layer,this.id);
          this.layer = v;
        },
        velocityX:0,
        Y_Force:0,
        X_Force:0,
        friction:0,
        wind_resistence:0,
        mass:0,
        getMasa: function(){
          return this.mass;
        },
        extraForce:0,
        extraForceAngle:0,
        windSpeed:0,
        solid:0,
        XContactFunction: "",
        YContactFunction: "",
        ContactFunction: "",
        static: 1,
        canRemove: 0,
        remove: "",
        name : (typeof name == undefined ) ? "map" : name,
        visible : true,
        posX : 0,
        focusPosX : 0,
        setPos: function(x,y){
          this.posX = x;
          this.posY = y;
        },
        setPosX : function(x){
          if(that.checkHorizontalColision(this,x)){
            this.posX = x;
            return true
          }
          return false
        },
        calculePosX : function() { return this.posX; },
        posY : 0,
        focusPosY : 0,
        setPosY : function(y){
          if(that.checkVerticalColision(this,y)){
            this.posY = y;
            return true;
          }
          return false
        },
        calculePosY : function(){ return  this.img.height - this.viewportY - this.posY ; },
        viewportX : this.width,
        setViewportX : function(val){ this.viewportX = val; },
        viewportY : this.height,
        setViewportY : function(val){ this.viewportY = val; },
        type: "", // image , blocks , multi
        mapObjects: [],
        addObject: function(obj){
          if(obj instanceof Array){
            for (var i = 0; i < obj.length; i++) {
              this.mapObjects[this.mapObjects.length] = obj[i];
              if(obj[i].layer != this.layer) obj[i].setLayer(this.layer)

            }
          }else{
            this.mapObjects[this.mapObjects.length] = obj;
            if(obj.layer != this.layer) obj.setLayer(this.layer)
          }
        },
        img: "",
        imgSrc: "",
        loadImg : function(fn){
          that.imgs[this.id] = new Image();
          that.imgs[this.id].onload = function(id){
            that.getObjectById(id).img = that.imgs[id];
            if(typeof fn == "function") fn(that.getObjectById(id));
          }(this.id)
          that.imgs[this.id].src = this.imgSrc;
        },
        setImgSrc : function(imgUrl,fn){ this.imgSrc = imgUrl; this.loadImg(fn); },
      };
      cm_obj = (typeof name == "object") ? that.mergeObjects(name,cm_obj) : cm_obj;
      if(typeof that.objectsByLayer[cm_obj.layer] == "undefined"){
        that.objectsByLayer[cm_obj.layer] = Array();
      }
      that.objectsByLayer[cm_obj.layer][that.objectsByLayer[cm_obj.layer].length] = cm_obj;

      return cm_obj;
    }

    co_self.getObjectById = function(id){
      that = this;
      o = that.getAllObjects();
      for (var i = 0; i < o.length; i++) {
        if((o[i] != undefined ) && o[i].id == id) return o[i]
      }

    }

    co_self.createObject = function(type){
      that = this;
      that._mapsimageTotals++;
      _object = {
        setPos: function(x,y){
          this.posX = x;
          this.posY = y;
        },
        setPosX : function(x){
          if(this.static == 1) return false;
          if(that.checkHorizontalColision(this,x)){
            this.posX = x;
            return true
          }
          return false;
        },
        setPosY : function(y){
          if(this.static == 1) return false;
          if(that.checkVerticalColision(this,y)){
            this.posY = y;
            return true;
          }
          return false
        },
        name: "",
        canDraw: 1,
        focus_y: false,
        focus_x: false,
        weight: 0,
        velocityX:0,
        Y_Force:0,
        X_Force:0,
        friction:0,
        wind_resistence:0,
        mass:0, // if hass always > 1
        getMasa: function(){
          return this.mass;
        },
        extraForce:0,
        extraForceAngle:0,
        windSpeed:0,
        XContactFunction: "",
        YContactFunction: "",
        ContactFunction: "",
        solid:1,
        static: 0,
        canRemove: 0,
        remove: "",
        id: that._mapsimageTotals,
        img: "",
        imgSrc: "",
        setImgSrc : function(imgUrl,fn){ this.imgSrc = imgUrl; this.loadImg(fn); },
        layer: 0,
        loadImg : function(fn){
          that.imgs[this.id] = new Image();
          that.imgs[this.id].onload = function(id){
            that.getObjectById(id).img = that.imgs[id];
            if(typeof fn == "function") fn(that.getObjectById(id));
          }(this.id)
          that.imgs[this.id].src = this.imgSrc;
        },
        setLayer: function(v){
          if(typeof that.objectsByLayer[v] == "undefined") that.objectsByLayer[v] = Array();
          that.objectsByLayer[v][that.objectsByLayer[v].length] = this;
          that.removeFromLayers(this.layer,this.id);
          this.layer = v;
        },
        sprite: "",
        events: "",
        startPosX: 0,
        startPosY: 0,
        posX: 0,
        posY: 0,
        drawPosX: function(){
          if(this.type == "mapObjectNotFocused") return this.posX
          return (that.focusXEnabled ) ? this.posX - that.focusedObject.posX + that.focusedObject.startPosX : this.posX;
        },
        drawPosY: function(){
          if(this.type == "mapObjectNotFocused") return this.posY
          return  (that.focusYEnabled) ? (this.posY - that.focusedObject.posY + that.focusedObject.startPosY) : this.posY
        },
        focusPosX: 0,
        focusPosY: 0,
        width: 0,
        height: 0,
        startSpriteX: 0,
        startSpriteY: 0,
        endSpriteX: 0,
        endSpriteY: 0
      }

      _object = (typeof type == "object") ? that.mergeObjects(type,_object) : _object;

      if(typeof that.objectsByLayer[_object.layer] == "undefined"){
        that.objectsByLayer[_object.layer] = Array();
      }
      that.objectsByLayer[_object.layer][that.objectsByLayer[_object.layer].length] = _object;


      // _object.startPosY = _object.posY
      // _object.startPosX = _object.posX
      return _object;
    }

    co_self.mergeObjects = function(a,b){
      var c = {};
      for (var attrname in b) { c[attrname] = b[attrname]; }
      for (var attrname in a) { c[attrname] = a[attrname]; }
      return c;
    }

    co_self.removeFromLayers = function(l,id){
      that = this;
      for (var i = 0; i < that.objectsByLayer[l].length; i++) {
        if(that.objectsByLayer[l][i].id == id) that.objectsByLayer[l] = that.objectsByLayer[l].slice(i,1);
      }

    }

    co_self.setXFocus = function(obj){
      that = this;
      o = that.getAllObjects()
      that.focusXEnabled = true;
      for (var i = 0; i < o.length; i++) {
        o[i].startPosX = o[i].posX
        if((o[i].id == obj.id)){
          o[i].focus_x = true;
          that.focusedObject = obj;
          o[i].focusPosX = o[i].posX;
        }else{
          o[i].focus_x = false;
        }
      }
    }

    co_self.cancelXFocus = function(obj){
      that = this;
      that.focusXEnabled = false;
      obj.focus_x = false;
    }

    co_self.setYFocus = function(obj){
      that = this;
      o = that.getAllObjects()
      that.focusYEnabled = true;
      for (var i = 0; i < o.length; i++) {
        o[i].startPosY = o[i].posY
        if((o[i].id == obj.id)){
          o[i].focus_y = true;
          that.focusedObject = obj;
          o[i].focusPosY = o[i].posY;
        }else{
          o[i].focus_y = false;
        }
      }
    }

    co_self.cancelYFocus = function(obj){
      that = this;
      that.focusYEnabled = false;
      obj.focus_y = false;
    }

    co_self.checkVerticalColision = function(Obj,y){
      that = this;
      if(Obj.solid == 0) return true;
      if(that.objectsByLayer[Obj.layer].length < 2) return true
      V_objs = that.objectsByLayer[Obj.layer];
      canMove = true;
      for (var i = 0; i < V_objs.length; i++) {
        if((V_objs[i].id != Obj.id) && V_objs[i].solid > 0){
          if(that.checkPos(V_objs[i],Obj,Obj.posX,y) == false) {
              if (Obj.posY > y) {
                Obj.posY = V_objs[i].posY+Obj.height
                if(typeof Obj.YContactFunction == "function") Obj.YContactFunction(V_objs[i],"down")
                if(typeof Obj.ContactFunction == "function") Obj.ContactFunction(V_objs[i],"down")
              }else{
                Obj.posY = V_objs[i].posY-V_objs[i].height
                if(typeof Obj.YContactFunction == "function") Obj.YContactFunction(V_objs[i],"up")
                if(typeof Obj.ContactFunction == "function") Obj.ContactFunction(V_objs[i],"up")
              }
              Obj.Y_Force = 0;
            canMove = false;
          }
          // console.log(1)
        }
      }
      return canMove
    }

    co_self.checkHorizontalColision = function(Obj,x){
      that = this;
      if(Obj.solid == 0) return true;
      if(that.objectsByLayer[Obj.layer].length < 2) return true
      H_objs = that.objectsByLayer[Obj.layer];
      canMove = true;
      for (var i = 0; i < H_objs.length; i++) {
        if((H_objs[i].id != Obj.id) && H_objs[i].solid > 0){
          if(that.checkPos(H_objs[i],Obj,x,Obj.posY) == false) {
            if (Obj.posX > x) {
              Obj.posX = H_objs[i].posX+H_objs[i].width
              if(typeof Obj.XContactFunction == "function") Obj.XContactFunction(V_objs[i],"left")
              if(typeof Obj.ContactFunction == "function") Obj.ContactFunction(V_objs[i],"left")
            }else{
              Obj.posX = H_objs[i].posX-Obj.width
              if(typeof Obj.XContactFunction == "function") Obj.XContactFunction(V_objs[i],"right")
              if(typeof Obj.ContactFunction == "function") Obj.ContactFunction(V_objs[i],"right")
            }
            Obj.X_Force = 0;
            canMove = false;
          }
        }
      }
      return canMove
    }

    co_self.checkPos = function(obj2,obj1,x,y){
      if (
        (obj2.posX+obj2.width > x) &&
        (obj2.posX < x+obj1.width) &&

        (obj2.posY < y+obj2.height) &&
        (obj2.posY+obj1.height > y)
        )
      {
        return false
      }else{
        return true
      }
    };



    co_self.windsForcesIds = -1;
    co_self.windsForces = Array();
    co_self.windsForcesInterval = Array();
    co_self.startWind = function(l){
      that = this;
      that.windsForcesIds++;
      w_obj = {};
      w_obj.name = "WIND";
      w_obj.id = that.windsForcesIds;
      w_obj.layer = l;
      w_obj.force = 1
      w_obj.setWindForce = function(newVal){
        this.force = newVal
      };
      that.windsForces[w_obj.id] = w_obj;

      that.windsForcesInterval[w_obj.id] = setInterval(function(id){
        layer = that.windsForces[id].layer;
        makeForce = true
        for (var k = 0; k < that.XFORCES.length; k++) {
          if(that.XFORCES[k].layer == layer) makeForce = false;
        }
        wind_objects = that.objectsByLayer[layer];

        for (var i = 0; i < wind_objects.length; i++) {
          wind_objects[i].X_Force = that.windsForces[id].force * wind_objects[i].windSpeed+1;

          // if(wind_objects[i].layer != layer ) console.log(wind_objects[i].name)
          if(wind_objects[i].X_Force > 0){
            if(makeForce){
              wind_objects[i].setPosX(wind_objects[i].posX + wind_objects[i].X_Force)
            }
          }
        }

      },10,(w_obj.id))

      return w_obj;

    }

    co_self.gravityForcesIds = -1;
    co_self.gravityForces = Array();
    co_self.startGravity = function(global,l){
      that = this;
      that.gravityForcesIds++;
      g_obj = {};
      g_obj.name = "GRAVITY";
      g_obj.id = that.gravityForcesIds;
      g_obj.layer = l;
      g_obj.force = (9.8/10)*(-1)
      g_obj.setGravity = function(newVal){
        this.force = (newVal/10)*(-1)
      };
      that.gravityForces[g_obj.id] = g_obj;

      that.gravityForcesInterval = function(){
        this.id = g_obj.id
        this.layer = that.gravityForces[this.id].layer;
        this.gravityForce = that.gravityForces[this.id].force;

        this.g_objects = that.objectsByLayer[this.layer];

        for (var i = 0; i < this.g_objects.length; i++) {
          if(this.g_objects[i].static == 0 ){
            newY =  this.g_objects[i].posY+this.g_objects[i].Y_Force
            if(this.g_objects[i].Y_Force != 0 && this.g_objects[i].Y_Force > 0){
              //JUMP
              if(this.g_objects[i].setPosY(newY)) this.g_objects[i].Y_Force = (this.g_objects[i].Y_Force + this.gravityForce) / ((this.g_objects[i].mass > 0) ? this.g_objects[i].mass : 1) ;
            }else {
              //FALLING
              if(this.g_objects[i].setPosY(newY)) this.g_objects[i].Y_Force = (this.g_objects[i].Y_Force + this.gravityForce) / ((this.g_objects[i].wind_resistence > 0) ? this.g_objects[i].wind_resistence : 1) ;
            }
          }
        }
      }
      intervalObject = {
        parameter: co_self,
        interval: function(parameter){
          console.log(parameter.GlobalID)
        }
      }
      CANVAS_INTERVAL_FUNCTIONS[CANVAS_INTERVAL_FUNCTIONS.length] = intervalObject

      return g_obj;
    }

    co_self.XFORCESIds = -1;
    co_self.XFORCES = Array();
    co_self.startXFORCES = function(global,l){
      that = this;
      that.XFORCESIds++;
      xf_obj = {};
      xf_obj.name = "X_FORCE";
      xf_obj.id = that.XFORCESIds;
      xf_obj.layer = l;

      that.XFORCES[xf_obj.id] = xf_obj;

      that.XFORCESInterval = function(){
        this.id = xf_obj.id
        this.layer = that.XFORCES[this.id].layer;
        this.XForces_objects = that.objectsByLayer[this.layer];
        console.log(that.objectsByLayer[this.layer])

        for (var i = 0; i < this.XForces_objects.length; i++) {
          if(this.XForces_objects[i].static == 0 ){
            newX =  this.XForces_objects[i].posX+this.XForces_objects[i].X_Force
            if(this.XForces_objects[i].X_Force != 0 && this.XForces_objects[i].X_Force > 0){
              //RIGHT
              if(this.XForces_objects[i].setPosX(newX)) this.XForces_objects[i].X_Force = (this.XForces_objects[i].X_Force + (this.XForces_objects[i].friction*(-1)/100)  )  ;
            }else if(this.XForces_objects[i].X_Force != 0 && this.XForces_objects[i].X_Force < 0){
              //LEFT
              if(this.XForces_objects[i].setPosX(newX)) this.XForces_objects[i].X_Force = (this.XForces_objects[i].X_Force + (this.XForces_objects[i].friction/100) ) ;
            }
          }


        }
      }
      intervalObject = {
        parameter: that,
        interval: function(parameter){
          console.log(parameter.GlobalID)
        }
      }



      CANVAS_INTERVAL_FUNCTIONS[CANVAS_INTERVAL_FUNCTIONS.length] = intervalObject

      return xf_obj;

    }

    co_self.EXTRAFORCESIds = -1;
    co_self.EXTRAFORCES = Array();
    co_self.EXTRAFORCESInterval = Array();
    co_self.startEXTRAFORCES = function(l,axis,type){
      that = this;
      that.EXTRAFORCESIds++;
      extraxf_obj = {};
      extraxf_obj.name = "EXTRA_FORCE";
      extraxf_obj.id = that.EXTRAFORCESIds;
      extraxf_obj.layer = l;
      extraxf_obj.axis = axis;
      extraxf_obj.force = 1;
      extraxf_obj.type = type; // acelerate , constant
      extraxf_obj.setForce = function(newVal){
        this.force = newVal;
      }

      that.EXTRAFORCES[extraxf_obj.id] = extraxf_obj;

      that.EXTRAFORCESInterval[extraxf_obj.id] = setInterval(function(id){
        layer = that.EXTRAFORCES[id].layer;
        axis = that.EXTRAFORCES[id].axis;
        force = that.EXTRAFORCES[id].force;
        EXTRAForces_objects = that.objectsByLayer[layer];
        for (var i = 0; i < EXTRAForces_objects.length; i++) {
          if(EXTRAForces_objects[i].static == 0 ){
            if(axis == "x"){
              if(type == "acelerate"){
                EXTRAForces_objects[i].X_Force+= force;
              }else{
                if(force > 0 && EXTRAForces_objects[i].X_Force < force){
                  EXTRAForces_objects[i].X_Force+= force;
                }else if(force < 0 && EXTRAForces_objects[i].X_Force > force){
                  EXTRAForces_objects[i].X_Force+= force
                };
              }
            }else if(axis == "y"){
              if(type == "acelerate"){
                EXTRAForces_objects[i].Y_Force+= force
              }else{
                if(force > 0 && EXTRAForces_objects[i].Y_Force < force){
                   EXTRAForces_objects[i].Y_Force+= force;
                }else if(force < 0 && EXTRAForces_objects[i].Y_Force > force){
                  EXTRAForces_objects[i].Y_Force+= force
                };
              }
            }

          }


        }

      },10,(extraxf_obj.id))

      return extraxf_obj;

    }
    CANVAS_OBJECTS[CANVAS_OBJECTS.length] = co_self;
    return co_self;
  }
}
