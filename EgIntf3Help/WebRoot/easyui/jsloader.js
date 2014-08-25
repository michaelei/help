/**************************************************************
 * JSLoader - JavaScript on Loading Demand - jsloader.sourceforge.net
 *
 * Copyright (c) 2007, Morgan Stanley & Co. Incorporated
 *
 * THE FOLLOWING DISCLAIMER APPLIES TO ALL SOFTWARE CODE AND OTHER
 * MATERIALS CONTRIBUTED IN CONNECTION WITH JSLoader:
 *
 * THIS SOFTWARE IS LICENSED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED AND ANY WARRANTY OF NON-
 * INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, 
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR 
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. THIS SOFTWARE MAY
 * BE REDISTRIBUTED TO OTHERS ONLY BY EFFECTIVELY USING THIS OR ANOTHER
 * EQUIVALENT DISCLAIMER AS WELL AS ANY OTHER LICENSE TERMS THAT MAY APPLY.
 *
 * -------------------------------------------------------------
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 * 
 * You can also find a copy of the GNU Lesser Public License at
 * <http://www.gnu.org/licenses/>.
 * 
 ***********************************************************/

/*
 * @fileoverview JSLoaderEnvironment is intended to model a simplified
 * runtime environment for loading other web functionality, such 
 * as RIA/JavaScript files onto the page. Example code:
 * <pre>
 *    @lt;script src="path/to/jsloader.js"&gt;&lt;/script&gt;
 *    @lt;script type="text/javascript"&gt;
 *       // JSLoader is already defined by including jsloader.js
 *       JSLoader.load("meta","project","release");
 *    &lt;/script&gt;
 * </pre>
 */

/** 
 * Construct a new JSLoaderEnvironment instance
 * @class JSLoaderEnvironment is the class designed to be a 
 * representation of a unix-like shell environment.
 * The purpose of this is to allow the infrastructure to abstract
 * away any library file location knowledge for rapid and enterprise
 * adoption and deployment
 */
function JSLoaderEnvironment(){
  
  // Defaul
  this.projectname = "mvnp1";
  this.prefix="/"+this.projectname+"/";
  this.initCtx = this.prefix;

  // Auto-discover location
  var _remote=false;
  var s=0;
  var _script_tags=document.getElementsByTagName("script");
  var endsWith=function(str, substr){
    return (str && str.indexOf(substr) == (str.length-substr.length));
  };
  for(s=0;s<_script_tags.length;++s){ 
    var src=_script_tags[s].src;
    var src_orig=src;
    if(src){
      if(src.indexOf("://")>-1)
	{
	  src=src.substring(src.indexOf("://")+3);
	  src=src.substring(src.indexOf("/"));
	}
      if(endsWith(src,"jsloader.js") || endsWith(src,"jsloader-debug.js")) {
		// If the domain is remote, assume we're running in hosted mode
		_remote=(src_orig.indexOf(document.domain)==-1);
		if(_remote) src=src_orig;
	  
	  this.prefix=src.substring(0, src.lastIndexOf("/")+1);
      }
    }
  }
   
  /**
   * @private
   */
  this.suffix=".js";

  /**
   * @private
   * Make the Path of a module to meta/proj/release
   */
  this.makeJSLoaderPath=function(m,p,r,suff){
    // if just a url is specified, use it
    if(!p && !r) return this.stripExternalRef(m);

    // build the m/p/r path
    //return this.prefix+m+"/"+p+"/incr/versions/"+r+ ((suff)?this.suffix:"");
    return this.prefix+m+"/"+p+"/"+r+ ((suff)?this.suffix:"");
  }

  /**
   * The generate the path prefix for a MPR linked into the JSLoader Environmentiables
   * @param m meta
   * @param p project
   * @param r release
   */
  this.makePath=function(m,p,r){
    // if just a url is specified, use it
    if(!p && !r) return this.stripExternalRef(m);

    // build the m/p/r path
    return this.prefix + m +"/" + p + "/" + r + "/";
  }

  /**
   * @private
   */
  this.env=new Object();

  /**
   * @private
   */
  this.loaders=new Object();

  /**
   * The sets an environment variable (make sure it's safe for JS Object[key] notation)
   * The idea here is that modules could set this, and pages which load the module
   * can then get the Environment variables
   * @param k javascript object[key] 
   * @param v value (technically could be of any type...)
   */
  this.setEnv=function(k,v){ 
    this.env[k]=v;
  }

  /**
   * The gets an environment variable previously set
   * @param k javascript object[key] 
   * @returns the value set for this key
   */
  this.getEnv=function(k){ return this.env[k];}

  /**
   * Lists all modules 
   * loaded in this environment.
   * @private
   */
  this._loadedJSLoaders=new Object();
        
  /**
   * This makes a normalized key to stick into loaded_modules and verify if things are loaded.
   * @private
   */
  this.normalize=function(m,p,r){ return (m+"__"+p+"__"+r).toLowerCase();};

  /**
   * This checks whether the given meta/project/release is already loaded.
   * @param m metaproject (or the path of a JS file, if no other args are passed)
   * @param p project
   * @param r release
   * @type boolean
   * @returns Whether m/p/r is loaded
   */
  this.isLoaded=function(m,p,r){
    var xkey=this.normalize(m,p,r);
    return(this._loadedJSLoaders[xkey]!=null);
  };


  /**
   * Gets a "loader" based on the MPR specified in the arguments
   * This is useful for loading subpackages.  You can call {@link JSSubLoader#load} or {@link JSSubLoader#loadAll} on this
   * and it will load submodules under a folder with the "release" number
   * @see JSSubLoader
   * @param m metaproject 
   * @param p project
   * @param r release
   * @returns void
   */
  this.getLoader=function(m,p,r){
    var key=this.normalize(m,p,r);
    var loader=this.loaders[key];
    if(loader) {
      return loader;
    }
    else {
      loader=new JSSubLoader(this,this.makeJSLoaderPath(m,p,r,false)+"/");
      var __path=this.makePath(m,p,r);
      this.setEnv(p.toUpperCase()+"_PATH",__path);
      this.loaders[key]=loader;
      return loader;
    }
  }
  
  /**
   * Loads the requested module into the environment
   * You can also load your own module by calling loadJavascript(url) if you want
   * @param m metaproject 
   * @param p project
   * @param r release
   * @type boolean
   * @returns void
   */
  this.load=function(m,p,r){
    var key=this.normalize(m,p,r);
    var url=this.makeJSLoaderPath(m,p,r,true); 
    try{
      if(this.isLoaded(m,p,r)) {
	return;
      }
      this.loadJavaScript(url);
      this._loadedJSLoaders[key]="true";
    } catch (e){ this.handleError(e); }
  };


  /**
   * Loads a JavaScript file into the page 
   * @param {String} url the url of the javascript file
   */
  this.loadJavaScript=function (url){
    url = this.stripExternalRef(url);
    var url2 = url+'?'+Math.random();
    document.writeln("<scri"+"pt src='"+url2+"' type='text/javascript'></sc"+"ript>");
  };

  /**
   * Loads a JavaScript file into the page 
   * @param {String} url the url of the javascript file
   */
  this.loadStyleSheet=function(url){
    url = this.stripExternalRef(url);
    document.writeln("<li"+"nk rel='stylesheet' href='"+url+"' type='text/css'></li"+"nk>");
  };


  /**
   * Strips out any double slashes, double dots, or cross domain references.
   * @param s string
   */
  this.stripExternalRef=function(s){
    var exprs = [/\.\.+/g,/\/\/+/g,/\\\\+/g,/\:+/g,/\'+/g,/\%+/g];
    
    // If it's hosted, we relax the protocol related regex
    exprs = [/\.\.+/g,/\\\\+/g,/\'+/g,/\%+/g];
    
    if (_remote)
    
    for(var i=0; i<exprs.length; i++)
      {
	s = s.replace(exprs[i], '');
      }

    return s;
  }

  /**
   *  Overwritable error handler
   */
  this.handleError=function(e) {
  }
  
  /**
   * dynamic load javascript content using jquery .ajax method
   * depends: jquery
   */
   var scriptsArray = new Array(); //二维数组，js和boolean，表示是否成功了
   		//根据js来找到里面的一个数组
		var fnFindArrayByJs = function(js){
			var array = null;
			for(var i=0;i<scriptsArray.length;i++){
				if(scriptsArray[i][0] == js){
					array = scriptsArray[i];
					break;
				}
			}
			return array;
		};
   
   this.dynamicLoad = function(js,callback,timeout){
   		var array = fnFindArrayByJs(js);
   		if(array == null){
			//新插入一个
			array = new Array();
			array[0] = js;
			array[1] = false;
			scriptsArray[scriptsArray.length] = array;
		}
		//如果已经成功load过了，那么直接调用函数
		if(array[1]){
			if(callback != null && (typeof callback == 'function'))
				callback.call(window);
			return;
		}
		//默认请求超时时间为10秒
		$.ajax({
			url:js,
			type:'GET',//默认采用GET方法
			dataType:'script',
			success:function(text){
				array[1] = true;
				//window.execScript ? window.execScript(text) : window.eval(text);
				if(callback != null && (typeof callback == 'function'))
					callback.call(window);
			},
			error:function(xhr,msg,e){
				alert('load js: '+js+' error. msg='+msg+' ,e='+e.message);
			},
			timeout:timeout!=null?timeout:10000
		});
   };
 
  return this;
};

/** 
 * Construct a new JSSubLoader instance. You shoudl never need to call this, as {@link JSLoaderEnvironment#getLoader} gets you one of these from the environment.
 * @class JSSubLoader is designed to load "sub" modules
 * This is a wrapper which is produced when you call  {@link JSLoaderEnvironment#getLoader} 
 * It is designed to allow sub-packages within a given MPR to be loaded easily. This is constructed by JSLoader.getLoader() call
 * so you should never really need to construct one of these.
 * @constructor
 * @param {JSLoaderEnvironment} env_  
 * @param {String} prefix_  The path underneath which the submodules reside
 * 
 */

function JSSubLoader(env_, prefix_){
  /**
   * @private
   */
  this.environment=env_;

  /**
   * @private
   */
  this.prefix=prefix_;

  /**
   * @private
   */

  this.loaded=new Object();

  /**
   * @private
   */
  this.normalize=function(str){ return str.toLowerCase(); }
  
  /**
   * Loads an array of subpackages
   * @param {Array} pkgs an array of packages.
   */

  this.loadAll=function(pkgs_){
    for(i=0;i<pkgs_.length;++i) this.load(pkgs_[i]);
  };

  /**
   * Loads a subpackage, if it's not already loaded
   * @param {String} url the url of the sub-package module file (m/p/r/submodule.js)
   */
  this.load=function(pkg){
    var p=this.normalize(pkg);
    if (this.loaded[p]) {
      return;
    }
    this.loaded[p]=pkg;
    this.environment.loadJavaScript(prefix_+pkg+".js");
  };
  
};

JSLoader = new JSLoaderEnvironment();

//  LocalWords:  fileoverview

//=====定义一些针对easyui的常用方法，以GM4开头
function GM4Environment(){
	//定义共有变量
	
	//定义私有变量和方法
	//调用几个load的超时时间
	var timeoutForGetUrl = 10000;
	//js的基础路径，便于dynamicLoadJs时候少写一点路径
	var jsBaseDir = '';
	
	/**
	 * 对一个url增加一个random参数
	 * 针对GEt方法使用
	 */
	var formatUrlWithRandom = function(url){
		if(url.indexOf('?') == -1){
			//无参数
			return url+'?fmtrdm='+Math.ceil(Math.random()*(999-100)+100);
		}else{
			//已经有参数了
			return url+'&fmtrdm='+Math.ceil(Math.random()*(999-100)+100);
		}
	};
	
	/**
	 * 使用jquery的ajax方式get某个url的内容，默认格式：text
	 */
	var jqueryAjaxGetUrl = function(url,callback,format){
		$.ajax({
			url:formatUrlWithRandom(url),
			type:'GET',
			dataType:format!=null?format:'text',
			success:function(result){
				if(callback==null || typeof(callback) != 'function')
					return;
				callback(result);
			},
			error:function(xhr,msg,e){
				alert('load url: '+url+' error. msg='+msg+' ,e='+e.message);
			},
			timeout:timeoutForGetUrl
		});
	};
	
	/**
	 * 根据id来判断某个dom对象是否存在
	 */
	var isObjExist = function(domId){
		return document.getElementById(domId)!=null?true:false;
	};
	
	/**
	  * 调用jquery的选择器，根据id或者直接传入obj
	  */
	  var jqueryObj =function(idOrObj){
	  	var obj = idOrObj;
	  	if(typeof(idOrObj)=='string'){
			if(idOrObj == ''){
				alert('ust specify a tabs object or id');
				return null;
			}
			if(idOrObj.substr(0,1) == '#'){
				obj = $(idOrObj);
			}else{
				obj = $('#'+idOrObj);
			}
			if(obj == null){
				alert('can not find a dom object with id='+tabsObjOrId);
				return null;
			}
		}
		return obj;
	  };
	  
	/**
	 * 判断一个字符串是否js字符串，以.js结尾
	 */
	var isJsFN = function(js){
		if(js == null || typeof(js) != 'string')
			return false;
		if(js.lastIndexOf('.js') != js.length-3)
			return false;
		return true;
	};
	
	//定义对外的常用方法
	/**
	 * 判断一个对象是否是数组
	 */
	this.isArray = function(obj){
		return Object.prototype.toString.call(obj)=='[object Array]'
	};
	
	/**
	 * 判断一个字符(oriStr)是否以某个字符(endStr)结尾
	 */
	this.isEndWith = function(oriStr,endStr){
		return oriStr.lastIndexOf(endStr) == oriStr.length-endStr.length;
	};
	
	/**
	 * 设置 jsBaseDir
	 */
	this.setJsBaseDir = function(jsbase){
		if(jsbase == null || typeof(jsbase) != 'string' || jsbase == ''){
			jsBaseDir = '';
			return;
		}
		jsBaseDir = this.isEndWith(jsbase,'/')?jsbase:jsbase+'/';
	};
	
	this.getJsBaseDir = function(){
		return jsBaseDir;
	};
	
	/**
	 * 读取和保持全局变量
	 * 如果dataValue=null，则移除
	 */
	this.setData = function(dataName,dataValue){
		if(dataName==null || typeof(dataName) != 'string')
			return;
		if(dataValue == null){
			$(document).removeData(dataName);
			return;
		}
		$(document).data(dataName,dataValue);
	};
	
	this.getData = function(dataName){
		if(dataName==null || typeof(dataName) != 'string')
			return null;
		return $(document).data(dataName);
	};
	
	/**
	 * 调用JSLoader的
	 */
	this.dynamicLoadJs = function(js,callback,timeout){
		if(js == null)
			return;
		//分为单个js和多个js来考虑
		if(typeof(js) == 'string'){
			//只有一个js时候，直接调用
			if(!isJsFN(js))
				return;
			if(jsBaseDir != '')
				js = jsBaseDir+js;
			JSLoader.dynamicLoad(js,callback,timeout);
		}else if(this.isArray(js)){
			//是一个js的数组，取出最后一个，递归调用
			if(js.length == 0){
				if(callback != null && (typeof callback == 'function'))
					callback.call(window);
				return;
			}
			var me = this;
			var tmpjs = js[js.length-1];
			if(jsBaseDir != '')
				tmpjs = jsBaseDir+tmpjs;
			js.length = js.length-1;
			JSLoader.dynamicLoad(tmpjs,function(){
				me.dynamicLoadJs(js,callback,timeout);
			});
		}
		
	};
	/**
	 * 设置jquery ajax 方法的超时时间
	 */
	 this.setGetUrlTimeout = function(timeout){
	 	if(timeout <= 0)
	 		return;
	 	timeoutForGetUrl = timeout;
	 };
	/**
	 * 根据url装载html并执行callback(html)
	 */
	 this.getUrlHtml = function(url,callback){
	 	jqueryAjaxGetUrl(url,callback,'html');
	 };
	 /**
	 * 根据url装载text并执行callback(text)
	 */
	 this.getUrlText = function(url,callback){
	 	jqueryAjaxGetUrl(url,callback);
	 };
	 /**
	 * 根据url装载json并执行callback(json)
	 */
	 this.getUrlJson = function(url,callback){
	 	jqueryAjaxGetUrl(url,callback,'json');
	 };
	 
	 /**
	 * 根据url装载js并执行callback(js)
	 * js会自动加载
	 */
	 this.getUrlJs = function(url,callback){
	 	jqueryAjaxGetUrl(url,callback,'script');
	 };
	 
	 /**
	  * 延时操作
	  */
	 this.delayOper = function(oper,delayTime){
	 	setTimeout(oper,delayTime);
	 };
	 
	 /**
	  * 以ajax post方式发送数据，返回json格式的字符
	  */
	 this.post = function(actionUrl,callback,param){
	 	if(actionUrl == null || typeof(actionUrl) != 'string'){
	  		alert('parameter actionUrl must specify and be a string');
	  		return;
	  	}
	  	if(callback != null && typeof(callback) != 'function'){
	  		alert('parameter callback must be a function');
	  		return;
	  	}
	  	if(param != null && typeof(param) != 'object'){
	  		alert('parameter param must be a object');
	  		return;
	  	}
	  	$.post(actionUrl,param,callback,'json');
	 };
	 
	 /**
	  * datebox的格式设置为yyyy-MM-dd
	  */
	 this.dateFormat_yyyyMMdd = function(date){
	 	var y = date.getFullYear();
		var m = date.getMonth()+1;
		var d = date.getDate();
		return y+'-'+(m<=9?'0'+m:m)+'-'+(d<=9?'0'+d:d);
	 };
	 
	 /**
	  * 日期和时间的格式：yyyy-MM-dd HH:mm:ss
	  */
	 this.dateFormat_yyyyMMddHHmmss = function(date){
	 	var y = date.getFullYear();
		var m = date.getMonth()+1;
		var d = date.getDate();
		var h = date.getHours();
		var mm = date.getMinutes();
		var s = date.getSeconds();
		return y+'-'+(m<=9?'0'+m:m)+'-'+(d<=9?'0'+d:d)+' '+(h<=9?'0'+h:h)+':'+(mm<=9?'0'+mm:mm)+':'+s;
	 };
	 
	 /**
	  * 日期和时间的格式：yyyy-MM-dd HH:mm
	  */
	 this.dateFormat_yyyyMMddHHmm = function(date){
	 	var y = date.getFullYear();
		var m = date.getMonth()+1;
		var d = date.getDate();
		var h = date.getHours();
		var mm = date.getMinutes();
		return y+'-'+(m<=9?'0'+m:m)+'-'+(d<=9?'0'+d:d)+' '+(h<=9?'0'+h:h)+':'+(mm<=9?'0'+mm:mm);
	 };
	 
	 /**
	  * 从一个yyyy-MM-dd格式的字符串得到一个日期型数据
	  */
	 this.parseDate_yyyyMMdd = function(str){
	 	if(str == '')
	 		return null;
	 	var yyyy = parseInt(str.substr (0,4));
		var mm = parseInt(str.substr (5,2))-1;
		var dd = parseInt(str.substr (8,2));
		return new Date(yyyy,mm,dd);
	 };
	 
	 //删除easy ui datagrid的全部数据
	 this.removeAllRowsOfGrid = function(gridId){
		var grid = $('#'+gridId);
		while(grid.datagrid('getRows')!=null && grid.datagrid('getRows').length>0){
			grid.datagrid('deleteRow',0);
		}
	};
	 
	
	/**
	 * 新增一个tab到tabs对象,其中的内容来自于url
	 * tabs: easyui tabs的id或者对象
	 * url: html或jsp
	 */
	this.addUrlTab = function(tabsObjOrId,title,url,closable){
		if(tabsObjOrId == null){
			alert('must specify a tabs object or id');
			return;
		}
		if(title == null || title == ''){
			alert('must specify a unique title string');
			return;
		}
		if(url == null || url == ''){
			alert('must specify a url string');
			return;
		}
		var tabs = jqueryObj(tabsObjOrId);
		if(tabs == null)
			return;
		//首先判断这个title是否存在，如果存在，则选择，不存在，则load url的内容并加载
		var tabPanel = tabs.tabs('getTab',title);
		if(tabPanel != null){
			//alert('tab panel with title '+title+' is exist');
			tabs.tabs('select',title);
			return;
		}
		//不存在，load url的内容
		this.getUrlHtml(url,function(html){
			tabs.tabs('add',{
				title:title,
				content:html,
				closable:closable!=null?closable:true
			});
		});
	};
	
	/**
	 * 装载form的数据
	 */
	 this.loadFormData = function(formIdOrObj,urlOrJson){
	 	var form = jqueryObj(formIdOrObj);
	 	if(form == null)
	 		return;
	 	form.form('load',urlOrJson);
	 };
	 
	 /**
	  * 表单提交
	  */
	  this.submitForm = function(formIdOrObj,actionUrl,callback,extraParams){
	  	//参数判断
	  	if(formIdOrObj == null){
	  		alert('parameter formIdOrObj must specify');
	  		return;
	  	}
	  	if(actionUrl == null || typeof(actionUrl) != 'string'){
	  		alert('parameter actionUrl must specify and be a string');
	  		return;
	  	}
	  	if(callback != null && typeof(callback) != 'function'){
	  		alert('parameter callback must be a function');
	  		return;
	  	}
	  	if(extraParams != null && typeof(extraParams) != 'object'){
	  		alert('parameter extraParams must be a object');
	  		return;
	  	}
	  	var form = jqueryObj(formIdOrObj);
	  	if(form == null)
	  		return;
	  	if(!form.form('validate')){
	  		alert('form content is not valid');
	  		return;
	  	}
	  	form.form('submit',{
	  		url:actionUrl==null?null:actionUrl,
	  		onSubmit:extraParams!=null?function(param){
	  			//javascript obj copy operation
	  			for(var i in extraParams){
	  				param[i] = extraParams[i];
	  			}
	  		}:null,
	  		success:callback==null?null:function(data){
	  			//把data转为json，并调用callback
	  			var json = eval('(' + data + ')');
	  			callback(json);
	  		}
	  	});
	  };
	  
	/**
	 * 打开一个窗口，需要load这个窗口的内容url
	 */
	this.openWin = function(winIdOrObj,winTitle,onOpenCallback,ctnUrl){
		//参数判断
	  	if(winIdOrObj == null){
	  		alert('parameter winIdOrObj must specify');
	  		return;
	  	}
	  	if(winTitle != null && typeof(winTitle) != 'string'){
	  		alert('parameter winTitle must a string');
	  		return;
	  	}
	  	if(onOpenCallback != null && typeof(onOpenCallback) != 'function'){
	  		alert('parameter onOpenCallback must be a function');
	  		return;
	  	}
	  	if(ctnUrl != null && typeof(ctnUrl) != 'string'){
	  		alert('parameter ctnUrl must a string');
	  		return;
	  	}
	  	var win = jqueryObj(winIdOrObj);
	  	if(win == null)
	  		return;
	  	if(winTitle != null){
	  		win.window({
	  			title:winTitle
	  		});
	  	}
	  	if(ctnUrl == null){
	  		//不需要load内容，直接打开窗口
	  		if(onOpenCallback != null){
	  			win.window({
	  				onOpen:onOpenCallback
	  			});
	  		}
	  		win.window('open');
	  	}else{
	  		//需要首先去load内容，然后再打开
	  		win.window({
	  			onLoad:function(){
	  				if(onOpenCallback != null){
			  			win.window({
			  				onOpen:onOpenCallback
			  			});
			  		}
			  		win.window('open');
	  			}
	  		});
	  		win.window('refresh',ctnUrl);
	  	}
	};
	
	/**
	 * 将内容加入到body中
	 */
	this.appendHtmlToBody = function(html,callback){
		$(document.body).append(html);
		if(callback != null && typeof(callback) == 'function'){
			//this.delayOper(callback,1000);
			callback();
		}
	};
	
	/**
	 * 从指定的url中加载数据并放入body中
	 * idExist: 根据传入的id判断，如果id已经存在了，那么表示这个url中的内容已经有了，不需要重新加入
	 */
	this.appendUrlToBody = function(url,callback,idExist){
		if(idExist != null && isObjExist(idExist)){
			if(callback != null && typeof(callback) == 'function')
				callback();
			return;
		}
		var me = this;
		me.getUrlHtml(url,function(result){
			me.appendHtmlToBody(result,callback);
		});
	};
	
	/**
	 * 调整dataGrid的高度，根据所在的div进行调节
	 */
	 this.autoFitDataGrid = function(gridId,divId){
	 	var grid = $('#'+gridId);
		var div = $('#'+divId);
		//计算现在div的高度
		var divHeightStr = div.css('height');
		var divHeight = parseInt(divHeightStr.substring(0,divHeightStr.length-2)) - 2;
		div.css('padding','1px');
		grid.datagrid({
			height:divHeight
		});
	 };
	
	return this;
};
GM4 = new GM4Environment();
