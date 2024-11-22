import RecruitlyEdgeApp from "@components/RecruitlyEdge.jsx";

const App = ({ apiServer = "https://api.edge.recruitly.io", apiKey = "HIRE61360F7E79E6D3834958B12773FBAA334EE1", jobId = "hire142386835c314a9aa80450f5996c6dcc" }) => {
  return <RecruitlyEdgeApp apiServer={apiServer} jobId={jobId} apiKey={apiKey} />;
};

export default App;
