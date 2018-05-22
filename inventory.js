document.addEventListener('DOMContentLoaded', function(){

  // Add event listeners for keyboard shortcuts
  document.addEventListener('keydown', function(e){
    if(e.which !== 9 && e.which !== 13){
      return;
    }

    // Stop page from tabbing or submitting
    e.preventDefault();

    const asset = document.getElementById('asset');
    const serial = document.getElementById('serial');

    // Go back to previous element if shift is held
    if(e.shiftKey){
      switch(e.target.id){
        case 'asset':
          serial.focus();
          break;

        case 'serial':
          asset.focus();
          break;

        default:break;
      }
      return;
    }

    // Select top most element with no value
    if(!asset.value.trim()){
      asset.focus();
      return;
    }

    if(!serial.value.trim()){
      serial.focus();
      return;
    }
  });
});
