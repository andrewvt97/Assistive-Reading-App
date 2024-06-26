import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useParams } from 'react-router-dom';
import {  Link } from 'react-router-dom';
import jsPDF from 'jspdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Reader() {
    const { title } = useParams(); // title of file
    const [file, setFile] = useState(null); // file with original pdf
    const [simplifiedPage, setSimplifiedPage] = useState(null); // file with simplified page
    const [numPages, setNumPages] = useState(null); // number of pages
    const [pageNumber, setPageNumber] = useState(1); // reader's progress
    const [isLoaded, setIsLoaded] = useState(false); // whether reader's progress has been fetched yet

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages); 
    }, []);

    // fetch original pdf
    const fetchPDF = async (url) => {
        try {
            const response = await axios.get(url, {
                responseType: 'blob',
                withCredentials: true
            });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setFile(fileURL);
        } catch (error) {
            console.error("Error fetching the PDF: ", error);
        }
    };

    // fetch simplified page for the pdf
    const fetchPage = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:3001/pdf/${encodeURIComponent(title)}/${pageNumber}`);
            // console.log(response.data);
            const paragraphs = response.data; // returns an array of paragraphs
            console.log(paragraphs);

            // Create a new PDF with jsPDF 
            const doc = new jsPDF();
            doc.setFont('Helvetica'); // Set the font to Helvetica
            doc.setFontSize(12); 
            let yPos = 50; // Vertical position for the first line of text
            const margin = 10; // Margin for the sides
            const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin; // Maximum width of text
        
            paragraphs.forEach(para => {
            // Split the paragraph into lines based on max width
            let lines = doc.splitTextToSize(para, maxWidth);
        
            lines = lines.map(line => line.trim()); 

            lines.forEach(line => {
             
                doc.text(line, margin, yPos);
                yPos += 10; // line height spacing
            });

            yPos += 5; // paragraph spacing
            });
            // Generate a blob URL from the PDF
            const pdfBlob = doc.output('blob');
            
            const pdfObjectUrl = URL.createObjectURL(pdfBlob);
            setSimplifiedPage(pdfObjectUrl); // Store the URL of the generated PDF blob in state

        } catch (error) {
            console.error("Error fetching or generating PDF: ", error);
        }
    };

    // fetch pdf on load or if title changes
    useEffect(() => {
        const encodedTitle = decodeURIComponent(title);
        // Fetch original PDF
        fetchPDF(`http://127.0.0.1:3001/pdf/${encodedTitle}`);
    }, [title]);


    // fetch simplfied page only after page number has been loaded
    useEffect(() => {     
        setSimplifiedPage(null);
        if (isLoaded){
            const encodedTitle = decodeURIComponent(title);
              // Fetch simplified PDF
            fetchPage(`http://127.0.0.1:3001/pdf/${encodedTitle}/${pageNumber}`);
        }     
    }, [title, pageNumber, isLoaded]);
    
    // load reading progress
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/get-progress/${encodeURIComponent(title)}`);
                setPageNumber(response.data.progress || 1);
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to load progress:', error);
                setPageNumber(1);
                setIsLoaded(true);
            }
        };
        setIsLoaded(false);
        loadProgress();
    }, [title]);

    // only save progress once page number is fetched
    useEffect(() => {
        if (isLoaded) { 
            const saveProgress = async () => {
                try {
                    await axios.post(`http://localhost:3001/update-progress/${encodeURIComponent(title)}`, {
                        page_number: pageNumber
                    });
                } catch (error) {
                    console.error('Failed to update progress:', error);
                }
            };
        

            saveProgress();
        }
    }, [pageNumber, title]);  
    
   
    // Function to go to the previous page
    const goToPrevPage = useCallback(() => 
    setPageNumber(prevPage => prevPage - 1),
     []);

    // Function to go to the next page
    const goToNextPage = useCallback(() => setPageNumber(prevPage => prevPage + 1), []);

    // return links and the pdf with simplification by its side
    return (
        <div>
            <div className="header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                marginTop: '-30px',           // Reduces top margin
                marginBottom: '2px',     
                backgroundColor: '#f5f5f5', // Light gray background
                padding: '5px 0',        
                width: '100%',            
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
                <Link to="/" className="home-button">App</Link>
                {numPages && (
                    <div className="pagination">
                        <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
                            Prev
                        </button>
                        <span>Page {pageNumber} of {numPages}</span>
                        <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
                            Next
                        </button>
                    </div>
                )}
                <Link to="/dashboard" className="dashboard-button">Dashboard</Link>
            </div>
            <div className="pdf-viewer" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div>
                    {file && (
                        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                            <Page pageNumber={pageNumber} scale={0.75}/>
                        </Document>
                    )}
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {simplifiedPage ? (
                        <Document file={simplifiedPage}>
                            <Page pageNumber={1} scale={0.85}/>
                        </Document>
                    ) : (
                        <div>Loading...</div>  // Display this when simplifiedPage is null
                    )}
                </div>
            </div>
            
        </div>
    );
}

export default Reader;