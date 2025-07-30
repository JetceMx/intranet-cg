import React, { useState, useEffect } from 'react';
import Sidebar from '../component/sidebar';
import UserHeader from '../component/usuario';
//import News from '../component/news';
import Cumple from '../component/cumple';
//import Atajos from '../component/atajos';
import '../Style/documentos.modules.css';

function Docs() {
  const [collapsed, setCollapsed] = useState(false);

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <UserHeader collapsed={collapsed} />
        {/*<News collapsed={collapsed} />*/}
        {/*<Atajos collapsed={collapsed}/>*/}      
        <Cumple collapsed={collapsed} />
      </div>
    </div>
  );
}

export default Docs;