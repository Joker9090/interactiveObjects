module.exports = {
  console.log("[COM] Create CanvasObject");
  CanvasObjects: {
    this.GID = -1;
    this.getID = function(){
      GID++;
      return GID;
    }

    this.CANVAS_INTERVAL_FUNCTIONS = [];
    this.CANVAS_INTERVAL = setInterval(function(){
      for (var i = 0; i < this.CANVAS_INTERVAL_FUNCTIONS.length; i++) {
        this.CANVAS_INTERVAL_FUNCTIONS[i].interval(this.CANVAS_INTERVAL_FUNCTIONS[i].parameter,this.CANVAS_INTERVAL_FUNCTIONS[i].forceID)
      }
    },10);

    this.CanvasObjectsManager = function(C){
      this.canvas = (typeof C == "undefined") ? undefined : C;
      this.PLAYERSBYROOM = [];
      this.MAPBYROOM = [];
      this.FORCESBYROOM = [];
      this.id = getID()
      this.gameType = "platform" // plataform, fromAbove
      this._mapsimageTotals = -1
      this.imgs = Array();
      this.objectsByLayer = Array();
      this.focusEnabled = false;
      this.focusXEnabled = false;
      this.focusYEnabled = false;
      this.focusedObject = {};

      this.fixHeightInvert = function(y,h){
        if(typeof this.canvas == "undefined") return y
        return this.canvas.c.height - y
      };

      this.getAllObjects = function(){
        newObjectList = Array();
        for (var i = 0; i < this.objectsByLayer.length; i++) {
          newObjectList = newObjectList.concat(this.objectsByLayer[i])
        }
        return newObjectList;
      }

      this.getObjectById = function(id){
       o = this.getAllObjects();
       for (var i = 0; i < o.length; i++) {
         if((o[i] != undefined ) && o[i].id == id) return o[i]
       }
      }

      this.mergeObjects = function(a,b){
        var c = {};
        for (var attrname in b) { c[attrname] = b[attrname]; }
        for (var attrname in a) { c[attrname] = a[attrname]; }
        return c;
      }

      this.removeFromLayers = function(l,id){

        for (var i = 0; i < this.objectsByLayer[l].length; i++) {
          if(this.objectsByLayer[l][i].id == id) this.objectsByLayer[l] = this.objectsByLayer[l].slice(i,1);
        }

      }

      this.setXFocus = function(obj){
        o = this.getAllObjects()
        this.focusXEnabled = true;
        for (var i = 0; i < o.length; i++) {
          o[i].startPosX = o[i].posX
          if((o[i].id == obj.id)){
            o[i].focus_x = true;
            this.focusedObject = obj;
            o[i].focusPosX = o[i].posX;
          }else{
            o[i].focus_x = false;
          }
        }
      }

      this.cancelXFocus = function(obj){
        this.focusXEnabled = false;
        obj.focus_x = false;
      }

      this.setYFocus = function(obj){
        o = this.getAllObjects()
        this.focusYEnabled = true;
        for (var i = 0; i < o.length; i++) {
          o[i].startPosY = o[i].posY
          if((o[i].id == obj.id)){
            o[i].focus_y = true;
            this.focusedObject = obj;
            o[i].focusPosY = o[i].posY;
          }else{
            o[i].focus_y = false;
          }
        }
      }

      this.cancelYFocus = function(obj){
        this.focusYEnabled = false;
        obj.focus_y = false;
      }

      this.checkVerticalColision = function(Obj,y){
        if(Obj.solid == 0) return true;
        if(this.objectsByLayer[Obj.layer].length < 2) return true
        V_objs = this.objectsByLayer[Obj.layer];
        canMove = true;
        for (var i = 0; i < V_objs.length; i++) {
          if((V_objs[i].id != Obj.id) && V_objs[i].solid > 0){
            if(this.checkPos(V_objs[i],Obj,Obj.posX,y) == false) {
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
          }
        }
        return canMove
      }

      this.checkHorizontalColision = function(Obj,x){
        if(Obj.solid == 0) return true;
        if(this.objectsByLayer[Obj.layer].length < 2) return true
        H_objs = this.objectsByLayer[Obj.layer];
        canMove = true;
        for (var i = 0; i < H_objs.length; i++) {
          if((H_objs[i].id != Obj.id) && H_objs[i].solid > 0){
            if(this.checkPos(H_objs[i],Obj,x,Obj.posY) == false) {
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

      this.checkPos = function(obj2,obj1,x,y){
        if (
          (obj2.posX+obj2.width > x) &&
          (obj2.posX < x+obj1.width) &&
          (obj2.posY < y+obj2.height) &&
          (obj2.posY+obj1.height > y) &&
          (obj2.room == obj1.room)
          )
        {
          return false
        }else{
          return true
        }
      };

      this.createMap = function(name){
        this._mapsimageTotals++;
        cm_obj = {
          parent: this,
          id : this._mapsimageTotals,
          type : "map",
          layer: 0,
          setLayer: function(v){
            if(typeof this.parent.objectsByLayer[v] == "undefined") this.parent.objectsByLayer[v] = Array();
            this.parent.objectsByLayer[v][this.parent.objectsByLayer[v].length] = this;
            this.parent.removeFromLayers(this.layer,this.id);
            this.layer = v;
          },
          velocityX:0,
          Y_Force:0,
          X_Force:0,
          friction:0,
          room: 0,
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
            if(this.parent.checkHorizontalColision(this,x)){
              this.posX = x;
              return true
            }
            return false
          },
          calculePosX : function() { return this.posX; },
          posY : 0,
          focusPosY : 0,
          setPosY : function(y){
            if(this.parent.checkVerticalColision(this,y)){
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
            this.parent.imgs[this.id] = new Image();
            this.parent.imgs[this.id].onload = function(obj,imgs){
              obj.img = imgs[obj.id];
              if(typeof fn == "function") fn(obj);
            }(this.parent.getObjectById(this.id),this.parent.imgs)
            this.parent.imgs[this.id].src = this.imgSrc;
          },
          setImgSrc : function(imgUrl,fn){ this.imgSrc = imgUrl; this.loadImg(fn); },
        };
        cm_obj = (typeof name == "object") ? this.mergeObjects(name,cm_obj) : cm_obj;
        if(typeof this.objectsByLayer[cm_obj.layer] == "undefined") this.objectsByLayer[cm_obj.layer] = Array();
        this.objectsByLayer[cm_obj.layer][this.objectsByLayer[cm_obj.layer].length] = cm_obj;
        console.log("[COM] Create map {"+this.id+"}")
        return cm_obj;
      }

      this.createObject = function(type){
        this._mapsimageTotals++;
        _object = {
          parent: this,
          setPos: function(x,y){
            this.posX = x;
            this.posY = y;
          },
          setPosX : function(x){
            if(this.static == 1) return false;
            if(this.parent.checkHorizontalColision(this,x)){
              this.posX = x;
              return true
            }
            return false;
          },
          setPosY : function(y){
            if(this.static == 1) return false;
            if(this.parent.checkVerticalColision(this,y)){
              this.posY = y;
              return true;
            }
            return false
          },
          name: "",
          room: 0,
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
          id: this._mapsimageTotals,
          img: "",
          imgSrc: "",
          setImgSrc : function(imgUrl,fn){ this.imgSrc = imgUrl; this.loadImg(fn); },
          layer: 0,
          loadImg : function(fn){
            this.parent.imgs[this.id] = new Image();
            this.parent.imgs[this.id].onload = function(obj,imgs){
              obj.img = imgs[obj.id];
              if(typeof fn == "function") fn(obj);
            }(this.parent.getObjectById(this.id),this.parent.imgs)
            this.parent.imgs[this.id].src = this.imgSrc;
          },
          setLayer: function(v){
            if(typeof this.parent.objectsByLayer[v] == "undefined") this.parent.objectsByLayer[v] = Array();
            this.parent.objectsByLayer[v][this.parent.objectsByLayer[v].length] = this;
            this.parent.removeFromLayers(this.layer,this.id);
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
            return (this.parent.focusXEnabled ) ? this.posX - this.parent.focusedObject.posX + this.parent.focusedObject.startPosX : this.posX;
          },
          drawPosY: function(){
            if(this.type == "mapObjectNotFocused") return this.parent.fixHeightInvert( this.posY )
            return  this.parent.fixHeightInvert( (this.parent.focusYEnabled) ? (this.posY - this.parent.focusedObject.posY + this.parent.focusedObject.startPosY) : this.posY )
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
        _object = (typeof type == "object") ? this.mergeObjects(type,_object) : _object;
        if(typeof this.objectsByLayer[_object.layer] == "undefined") this.objectsByLayer[_object.layer] = Array();
        this.objectsByLayer[_object.layer][this.objectsByLayer[_object.layer].length] = _object;
        console.log("[COM] Create object {"+this.id+"}")
        return _object;
      }

      this.gravityForcesIds = -1;
      this.gravityForces = Array();
      this.startGravity = function(l){
        this.gravityForcesIds++;
        g_obj = {};
        g_obj.name = "GRAVITY";
        g_obj.id = this.gravityForcesIds;
        g_obj.layer = l;
        g_obj.force = (9.8/10)*(-1)
        g_obj.setGravity = function(newVal){
          this.force = (newVal/10)*(-1)
        };
        this.gravityForces[g_obj.id] = g_obj;

        intervalObject = {
          parameter: this,
          forceID: g_obj.id,
          interval: function(parameter, id){
            this.id = id;
            this.layer = parameter.gravityForces[this.id].layer;
            this.gravityForce = parameter.gravityForces[this.id].force;
            this.g_objects = parameter.objectsByLayer[this.layer];
            for (var i = 0; i < this.g_objects.length; i++) {
              if(this.g_objects[i].static == 0 ){
                newY =  this.g_objects[i].posY+this.g_objects[i].Y_Force
                if(this.g_objects[i].Y_Force != 0 && this.g_objects[i].Y_Force > 0){
                  if(this.g_objects[i].setPosY(newY)) this.g_objects[i].Y_Force = (this.g_objects[i].Y_Force + this.gravityForce) / ((this.g_objects[i].mass > 0) ? this.g_objects[i].mass : 1) ;
                }else {
                  if(this.g_objects[i].setPosY(newY)) this.g_objects[i].Y_Force = (this.g_objects[i].Y_Force + this.gravityForce) / ((this.g_objects[i].wind_resistence > 0) ? this.g_objects[i].wind_resistence : 1) ;
                }
              }
            }
          }
        }
        CANVAS_INTERVAL_FUNCTIONS[CANVAS_INTERVAL_FUNCTIONS.length] = intervalObject
        console.log("[COM] Add Gravity {"+this.id+"}")
        return g_obj;
      }

      this.XFORCESIds = -1;
      this.XFORCES = Array();
      this.startXFORCES = function(l){
        this.XFORCESIds++;
        xf_obj = {};
        xf_obj.name = "X_FORCE";
        xf_obj.id = this.XFORCESIds;
        xf_obj.layer = l;
        this.XFORCES[xf_obj.id] = xf_obj;

        intervalObject = {
          parameter: this,
          forceID: xf_obj.id,
          interval: function(parameter,id){
            this.id = id
            this.layer = parameter.XFORCES[this.id].layer;
            this.XForces_objects = parameter.objectsByLayer[this.layer];
            for (var i = 0; i < this.XForces_objects.length; i++) {
              if(this.XForces_objects[i].static == 0 ){
                newX =  this.XForces_objects[i].posX+this.XForces_objects[i].X_Force
                if(this.XForces_objects[i].X_Force != 0 && this.XForces_objects[i].X_Force > 0){
                  if(this.XForces_objects[i].setPosX(newX)) this.XForces_objects[i].X_Force = (this.XForces_objects[i].X_Force + (this.XForces_objects[i].friction*(-1)/100)  )  ;
                }else if(this.XForces_objects[i].X_Force != 0 && this.XForces_objects[i].X_Force < 0){
                  if(this.XForces_objects[i].setPosX(newX)) this.XForces_objects[i].X_Force = (this.XForces_objects[i].X_Force + (this.XForces_objects[i].friction/100) ) ;
                }
              }
            }
          }
        }
        CANVAS_INTERVAL_FUNCTIONS[CANVAS_INTERVAL_FUNCTIONS.length] = intervalObject
        console.log("[COM] Add Xforce {"+this.id+"}")
        return xf_obj;
      }

      this.windsForcesIds = -1;
      this.windsForces = Array();
      this.windsForcesInterval = Array();
      this.startWind = function(l){
        this.windsForcesIds++;
        w_obj = {};
        w_obj.name = "WIND";
        w_obj.id = this.windsForcesIds;
        w_obj.layer = l;
        w_obj.force = 1
        w_obj.setWindForce = function(newVal){
          this.force = newVal
        }
        this.windsForces[w_obj.id] = w_obj;

        intervalObject = {
          parameter: this,
          forceID: w_obj.id,
          interval: function(parameter,id){
            this.id = id
            this.layer = parameter.windsForces[this.id].layer;
            this.makeForce = true
            for (var k = 0; k < parameter.XFORCES.length; k++) {
              if(parameter.XFORCES[k].layer == this.layer) this.makeForce = false;
            }
            this.wind_objects = parameter.objectsByLayer[this.layer];

            for (var i = 0; i < this.wind_objects.length; i++) {
              this.wind_objects[i].X_Force = parameter.windsForces[id].force * this.wind_objects[i].windSpeed+1;
              if(this.wind_objects[i].X_Force > 0){
                if(this.makeForce){
                  this.wind_objects[i].setPosX(this.wind_objects[i].posX + this.wind_objects[i].X_Force)
                }
              }
            }
          }
        }
        CANVAS_INTERVAL_FUNCTIONS[CANVAS_INTERVAL_FUNCTIONS.length] = intervalObject
        console.log("[COM] Add WindForce {"+this.id+"}")
        return w_obj;
      };

      this.EXTRAFORCESIds = -1;
      this.EXTRAFORCES = Array();
      this.EXTRAFORCESInterval = Array();
      this.startEXTRAFORCES = function(l,axis,type){
        this.EXTRAFORCESIds++;
        extraxf_obj = {};
        extraxf_obj.name = "EXTRA_FORCE";
        extraxf_obj.id = this.EXTRAFORCESIds;
        extraxf_obj.layer = l;
        extraxf_obj.axis = axis;
        extraxf_obj.force = 1;
        extraxf_obj.type = type; // acelerate , constant
        extraxf_obj.setForce = function(newVal){
          this.force = newVal;
        }
        this.EXTRAFORCES[extraxf_obj.id] = extraxf_obj;

        intervalObject = {
          parameter: this,
          forceID: extraxf_obj.id,
          interval: function(parameter,id){
            this.id = id
            this.layer = parameter.EXTRAFORCES[this.id].layer;
            this.axis = parameter.EXTRAFORCES[this.id].axis;
            this.force = parameter.EXTRAFORCES[this.id].force;
            this.EXTRAForces_objects = parameter.objectsByLayer[this.layer];
            for (var i = 0; i < this.EXTRAForces_objects.length; i++) {
              if(this.EXTRAForces_objects[i].static == 0 ){
                if(this.axis == "x"){
                  if(this.type == "acelerate"){
                    this.EXTRAForces_objects[i].X_Force+= this.force;
                  }else{
                    if(this.force > 0 && Ethis.XTRAForces_objects[i].X_Force < this.force){
                      this.EXTRAForces_objects[i].X_Force+= this.force;
                    }else if(this.force < 0 && this.EXTRAForces_objects[i].X_Force > this.force){
                      this.EXTRAForces_objects[i].X_Force+= this.force
                    };
                  }
                }else if(this.axis == "y"){
                  if(this.type == "acelerate"){
                    this.EXTRAForces_objects[i].Y_Force+= this.force
                  }else{
                    if(this.force > 0 && this.EXTRAForces_objects[i].Y_Force < this.force){
                       this.EXTRAForces_objects[i].Y_Force+= this.force;
                    }else if(this.force < 0 && this.EXTRAForces_objects[i].Y_Force > this.force){
                      this.EXTRAForces_objects[i].Y_Force+= this.force
                    };
                  }
                }
              }
            }
          }
        }
        CANVAS_INTERVAL_FUNCTIONS[CANVAS_INTERVAL_FUNCTIONS.length] = intervalObject
        console.log("[COM] Add ExtraForce {"+this.id+"}")
        return extraxf_obj;

      }

      console.log("[COM] Create CanvasObjectManager {"+this.id+"}")
      return this;
    }

    return this;
  }

}
