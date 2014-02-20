var jsdom = require("jsdom").jsdom;
global.document = jsdom("<html><head></head><body></body></html>");
global.window = document.createWindow();
global.jQuery = global.$ = require('jquery');;

require('./Consoloid/Base/jquery/jquery.inherit-1.3.2.M.js');
require('./Consoloid/Base/Object');
require("./Consoloid/Service/ServiceContainer");

global.jQuery.ready();
