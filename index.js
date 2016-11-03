// var colors = require('colors');
module.exports = {
  CanvasObjects: function(){
    this.gameType = "platform"; // plataform, fromAbove
    co_self = this;
    co_self._mapsimageTotals = -1
    co_self.imgs = Array();

    co_self.objectsByLayer = Array();

    co_self.focusEnabled = false;
    co_self.focusXEnabled = false;
    co_self.focusYEnabled = false;

    co_self.focusedObject = {};
    co_self.getAllObjects = function(){
      newObjectList = Array();
      for (var i = 0; i < co_self.objectsByLayer.length; i++) {
        newObjectList = newObjectList.concat(co_self.objectsByLayer[i])
      }
      return newObjectList;
     }

    co_self.createMap = function(name){
      co_self._mapsimageTotals++;
      cm_obj = {
        id : co_self._mapsimageTotals,
        type : "map",
        layer: 0,
        setLayer: function(v){
          if(typeof co_self.objectsByLayer[v] == "undefined") co_self.objectsByLayer[v] = Array();
          co_self.objectsByLayer[v][co_self.objectsByLayer[v].length] = this;
          co_self.removeFromLayers(this.layer,this.id);
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
          if(co_self.checkHorizontalColision(this,x)){
            this.posX = x;
            return true
          }
          return false
        },
        calculePosX : function() { return this.posX; },
        posY : 0,
        focusPosY : 0,
        setPosY : function(y){
          if(co_self.checkVerticalColision(this,y)){
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
          co_self.imgs[this.id] = new Image();
          co_self.imgs[this.id].onload = function(id){
            co_self.getObjectById(id).img = co_self.imgs[id];
            if(typeof fn == "function") fn(co_self.getObjectById(id));
          }(this.id)
          co_self.imgs[this.id].src = this.imgSrc;
        },
        setImgSrc : function(imgUrl,fn){ this.imgSrc = imgUrl; this.loadImg(fn); },
      };
      cm_obj = (typeof name == "object") ? co_self.mergeObjects(name,cm_obj) : cm_obj;
      if(typeof co_self.objectsByLayer[cm_obj.layer] == "undefined"){
        co_self.objectsByLayer[cm_obj.layer] = Array();
      }
      co_self.objectsByLayer[cm_obj.layer][co_self.objectsByLayer[cm_obj.layer].length] = cm_obj;

      return cm_obj;
    }

    co_self.getObjectById = function(id){
      o = co_self.getAllObjects();
      for (var i = 0; i < o.length; i++) {
        if((o[i] != undefined ) && o[i].id == id) return o[i]
      }

    }

    co_self.createObject = function(type){
      co_self._mapsimageTotals++;
      _object = {
        setPos: function(x,y){
          this.posX = x;
          this.posY = y;
        },
        setPosX : function(x){
          if(this.static == 1) return false;
          if(co_self.checkHorizontalColision(this,x)){
            this.posX = x;
            return true
          }
          return false;
        },
        setPosY : function(y){
          if(this.static == 1) return false;
          if(co_self.checkVerticalColision(this,y)){
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
        id: co_self._mapsimageTotals,
        img: "",
        imgSrc: "",
        setImgSrc : function(imgUrl,fn){ this.imgSrc = imgUrl; this.loadImg(fn); },
        layer: 0,
        loadImg : function(fn){
          co_self.imgs[this.id] = new Image();
          co_self.imgs[this.id].onload = function(id){
            co_self.getObjectById(id).img = co_self.imgs[id];
            if(typeof fn == "function") fn(co_self.getObjectById(id));
          }(this.id)
          co_self.imgs[this.id].src = this.imgSrc;
        },
        setLayer: function(v){
          if(typeof co_self.objectsByLayer[v] == "undefined") co_self.objectsByLayer[v] = Array();
          co_self.objectsByLayer[v][co_self.objectsByLayer[v].length] = this;
          co_self.removeFromLayers(this.layer,this.id);
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
          return (co_self.focusXEnabled ) ? this.posX - co_self.focusedObject.posX + co_self.focusedObject.startPosX : this.posX;
        },
        drawPosY: function(){
          if(this.type == "mapObjectNotFocused") return this.posY
          return  (co_self.focusYEnabled) ? (this.posY - co_self.focusedObject.posY + co_self.focusedObject.startPosY) : this.posY
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

      _object = (typeof type == "object") ? co_self.mergeObjects(type,_object) : _object;

      if(typeof co_self.objectsByLayer[_object.layer] == "undefined"){
        co_self.objectsByLayer[_object.layer] = Array();
      }
      co_self.objectsByLayer[_object.layer][co_self.objectsByLayer[_object.layer].length] = _object;


      _object.startPosX = _object.posX
      _object.startPosY = _object.posY
      return _object;
    }

    co_self.mergeObjects = function(a,b){
      var c = {};
      for (var attrname in b) { c[attrname] = b[attrname]; }
      for (var attrname in a) { c[attrname] = a[attrname]; }
      return c;
    }

    co_self.removeFromLayers = function(l,id){
      for (var i = 0; i < co_self.objectsByLayer[l].length; i++) {
        if(co_self.objectsByLayer[l][i].id == id) co_self.objectsByLayer[l] = co_self.objectsByLayer[l].slice(i,1);
      }

    }

    co_self.setXFocus = function(obj){
      o = co_self.getAllObjects()
      co_self.focusXEnabled = true;
      for (var i = 0; i < o.length; i++) {
        if((o[i].id == obj.id)){
          o[i].focus_x = true;
          co_self.focusedObject = obj;
          o[i].focusPosX = o[i].posX;
        }else{
          o[i].focus_x = false;
        }
      }
    }

    co_self.cancelXFocus = function(obj){
      co_self.focusXEnabled = false;
      obj.focus_x = false;
    }

    co_self.setYFocus = function(obj){
      o = co_self.getAllObjects()
      co_self.focusYEnabled = true;
      for (var i = 0; i < o.length; i++) {
        if((o[i].id == obj.id)){
          o[i].focus_y = true;
          co_self.focusedObject = obj;
          o[i].focusPosY = o[i].posY;
        }else{
          o[i].focus_y = false;
        }
      }
    }

    co_self.cancelYFocus = function(obj){
      co_self.focusYEnabled = false;
      obj.focus_y = false;
    }

    co_self.checkVerticalColision = function(Obj,y){
      if(Obj.solid == 0) return true;
      if(co_self.objectsByLayer[Obj.layer].length < 2) return true
      V_objs = co_self.objectsByLayer[Obj.layer];
      canMove = true;
      for (var i = 0; i < V_objs.length; i++) {
        if((V_objs[i].id != Obj.id) && V_objs[i].solid > 0){
          if(co_self.checkPos(V_objs[i],Obj,Obj.posX,y) == false) {
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
      if(Obj.solid == 0) return true;
      if(co_self.objectsByLayer[Obj.layer].length < 2) return true
      H_objs = co_self.objectsByLayer[Obj.layer];
      canMove = true;
      for (var i = 0; i < H_objs.length; i++) {
        if((H_objs[i].id != Obj.id) && H_objs[i].solid > 0){
          if(co_self.checkPos(H_objs[i],Obj,x,Obj.posY) == false) {
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
      co_self.windsForcesIds++;
      w_obj = {};
      w_obj.name = "WIND";
      w_obj.id = co_self.windsForcesIds;
      w_obj.layer = l;
      w_obj.force = 1
      w_obj.setWindForce = function(newVal){
        this.force = newVal
      };
      co_self.windsForces[w_obj.id] = w_obj;

      co_self.windsForcesInterval[w_obj.id] = setInterval(function(id){
        layer = co_self.windsForces[id].layer;
        makeForce = true
        for (var k = 0; k < co_self.XFORCES.length; k++) {
          if(co_self.XFORCES[k].layer == layer) makeForce = false;
        }
        wind_objects = co_self.objectsByLayer[layer];

        for (var i = 0; i < wind_objects.length; i++) {
          wind_objects[i].X_Force = co_self.windsForces[id].force * wind_objects[i].windSpeed+1;

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
    co_self.gravityForcesInterval = Array();
    co_self.startGravity = function(l){
      co_self.gravityForcesIds++;
      g_obj = {};
      g_obj.name = "GRAVITY";
      g_obj.id = co_self.gravityForcesIds;
      g_obj.layer = l;
      g_obj.force = (9.8/10)*(-1)
      g_obj.setGravity = function(newVal){
        this.force = (newVal/10)*(-1)
      };
      co_self.gravityForces[g_obj.id] = g_obj;

      co_self.gravityForcesInterval = setInterval(function(id){
        layer = co_self.gravityForces[id].layer;
        gravityForce = co_self.gravityForces[id].force;
        g_objects = co_self.objectsByLayer[layer];

        for (var i = 0; i < g_objects.length; i++) {
          if(g_objects[i].static == 0 ){
            newY =  g_objects[i].posY+g_objects[i].Y_Force
            if(g_objects[i].Y_Force != 0 && g_objects[i].Y_Force > 0){
              //JUMP
              if(g_objects[i].setPosY(newY)) g_objects[i].Y_Force = (g_objects[i].Y_Force + gravityForce) / ((g_objects[i].mass > 0) ? g_objects[i].mass : 1) ;
            }else {
              //FALLING
              if(g_objects[i].setPosY(newY)) g_objects[i].Y_Force = (g_objects[i].Y_Force + gravityForce) / ((g_objects[i].wind_resistence > 0) ? g_objects[i].wind_resistence : 1) ;
            }
          }
        }
      },10,(g_obj.id));

      return g_obj;
    }

    co_self.XFORCESIds = -1;
    co_self.XFORCES = Array();
    co_self.XFORCESInterval = Array();
    co_self.startXFORCES = function(l){
      co_self.XFORCESIds++;
      xf_obj = {};
      xf_obj.name = "X_FORCE";
      xf_obj.id = co_self.XFORCESIds;
      xf_obj.layer = l;

      co_self.XFORCES[xf_obj.id] = xf_obj;

      co_self.XFORCESInterval[xf_obj.id] = setInterval(function(id){
        layer = co_self.XFORCES[id].layer;
        XForces_objects = co_self.objectsByLayer[layer];
        for (var i = 0; i < XForces_objects.length; i++) {
          // if(XForces_objects[i].X_Force != 0 && g_objects[i].Y_Force > 0){
          //   XForces_objects[i].setPosX(XForces_objects[i].posX + XForces_objects[i].X_Force)
          // }
          if(XForces_objects[i].static == 0 ){
            newX =  XForces_objects[i].posX+XForces_objects[i].X_Force
            if(XForces_objects[i].X_Force != 0 && XForces_objects[i].X_Force > 0){
              //RIGHT
              if(XForces_objects[i].setPosX(newX)) XForces_objects[i].X_Force = (XForces_objects[i].X_Force + (XForces_objects[i].friction*(-1)/100)  )  ;
            }else if(XForces_objects[i].X_Force != 0 && XForces_objects[i].X_Force < 0){
              //LEFT
              if(XForces_objects[i].setPosX(newX)) XForces_objects[i].X_Force = (XForces_objects[i].X_Force + (XForces_objects[i].friction/100) ) ;
            }
          }


        }

      },10,(xf_obj.id))

      return xf_obj;

    }

    co_self.EXTRAFORCESIds = -1;
    co_self.EXTRAFORCES = Array();
    co_self.EXTRAFORCESInterval = Array();
    co_self.startEXTRAFORCES = function(l,axis,type){
      co_self.EXTRAFORCESIds++;
      extraxf_obj = {};
      extraxf_obj.name = "EXTRA_FORCE";
      extraxf_obj.id = co_self.EXTRAFORCESIds;
      extraxf_obj.layer = l;
      extraxf_obj.axis = axis;
      extraxf_obj.force = 1;
      extraxf_obj.type = type; // acelerate , constant
      extraxf_obj.setForce = function(newVal){
        this.force = newVal;
      }

      co_self.EXTRAFORCES[extraxf_obj.id] = extraxf_obj;

      co_self.EXTRAFORCESInterval[extraxf_obj.id] = setInterval(function(id){
        layer = co_self.EXTRAFORCES[id].layer;
        axis = co_self.EXTRAFORCES[id].axis;
        force = co_self.EXTRAFORCES[id].force;
        EXTRAForces_objects = co_self.objectsByLayer[layer];
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

    return co_self;
  }
}
