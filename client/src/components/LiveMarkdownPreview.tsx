import { useState } from "react";
import { marked } from "marked";

export const LiveMarkdownPreview = () => {
  const [markdown, setMarkdown] = useState("");

  const handleInputChange = (event:any) => {
    setMarkdown(event.target.value);
  }

  const getMarkdownText = () => {
    return { __html: marked(markdown) };
  };


  return(
    <>
      <div style={{display: "flex", height: "100vh"}}>
        {/*Markdown Input*/}
        <div style={{flex: 1, padding: '10px'}}>
          <h2>Markdown input</h2>
          <textarea 
            style={{width: '100%', height: '90%', padding: '10px'}}
            value={markdown}
            onChange={handleInputChange}
            placeholder="Enter Markdown here..."
          />
        </div>
        {/*HTML PREVIEW*/}
        <div style={{flex: 1, padding: "10px", borderLeft: "1px solid #ccc"}}>
          <h2>Preview</h2>
          <div 
            style={{width: "100%", height: "90%", overflowY: "auto", padding: "10px"}}
            dangerouslySetInnerHTML={getMarkdownText()}/>
        </div>
      </div>
    </>

  )
}
