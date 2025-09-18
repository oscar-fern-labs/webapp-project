const e = React.createElement;
function App() {
  const [status, setStatus] = React.useState('loading...');
  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(err => setStatus('error'));
  }, []);
  return e('div', {style:{fontFamily:'Arial, sans-serif',padding:'2rem'}},
    e('h1','Webapp Frontend'),
    e('p',null,'Backend health status: ', e('strong',null,status))
  );
}
ReactDOM.render(e(App), document.getElementById('root'));
