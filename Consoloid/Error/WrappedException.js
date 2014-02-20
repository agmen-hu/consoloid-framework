defineClass('Consoloid.Error.WrappedException',
{
  __constructor: function(message)
  {
    this.message = message;
  },

  toString: function()
  {
    return this.message;
  }
});
