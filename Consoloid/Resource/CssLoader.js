defineNamespace('Consoloid.Resource');

global.Consoloid.Resource.CssLoader = $.inherit(Consoloid.Base.Object,
  {
    load: function(cssId)
    {
      if ($('#' + cssId).length > 0) {
        return this;
      }

      var resourceName = cssId.replace(/-/gi,'/');
      $('head').append('<link rel="stylesheet" type="text/css" href="' + resourceName + '.css" id="' + cssId + '">');

      return this;
    }
  }
);
