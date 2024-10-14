

function setbtnimage(status, PsBaseFile, PoObj){
    if (status==0) {
      document.images[PoObj].src='/images/' + PsBaseFile + '1.gif';
    }else if (status==1){
      document.images[PoObj].src='/images/' + PsBaseFile + '2.gif';
    }else{
      document.images[PoObj].src='/images/' + PsBaseFile + '3.gif';
    }
  }

  function frameclose(){
    console.debug("frameclose");
    window.top.document.getElementById("nav").classList.add("closed");
    window.top.document.getElementById("content").classList.add("full-width");
    window.top.document.getElementById("pdf").classList.add("full-width");
    // window.top.document.getElementById("frameopen").classList.add("full-width"); 
    // window.top.document.getElementById("content").style.gridColumn = "1 / span 2";
    // window.top.document.getElementById("pdf").style.gridRow = "2 / span 1";
    // window.top.document.getElementById("frameopen").style.display="block"; 
  }

  function frameopen(){
    console.debug("frameopen");
    window.top.document.getElementById("nav").classList.remove("closed");
    window.top.document.getElementById("content").classList.remove("full-width");
    window.top.document.getElementById("pdf").classList.remove("full-width");
    // window.top.document.getElementById("frameopen").classList.remove("full-width"); 
    // window.top.document.getElementById("content").style.gridColumn = "2 / span 1";
    // window.top.document.getElementById("pdf").style.gridArea = "pdf";
    // window.top.document.getElementById("frameopen").style.display="none";
  }

  function toggleMenu() {
    const menu = window.top.document.getElementById('nav');
    const isClosed = menu.classList.contains("closed");
    
    if (isClosed) {
        frameopen();
    } else {
        frameclose();
    }
}
