import React, { useEffect, useRef, useState } from "react";
import { uid } from "uid";
import * as XLSX from "xlsx";
import "./App.css";
import { getInventoryWips } from "./api/wip/getInventoryWips";

function App() {
  const [data, setData] = useState([]);
  const [wcs, setWcs] = useState(true);
  const [dataTable, setDataTable] = useState([]);
  const [fields, setFields] = useState([]);
  const refSort = useRef({ key: "mohId", ascending: true });
  const refValue = useRef("");
  const refInsertRow = useRef(false);
  const refTotalWip = useRef(0);
  const refTempQty = useRef(0);
  const getWips = async () => {
    const wips = await getInventoryWips();
    const tableData = wips.data.filter((item) => {
      if (wcs === true) {
        return item.mohId > "30000";
      }
      return item.mohId < "30000";
    });

    setData(tableData);
  };

  const scrapeData = () => {
    // Acquire Data (reference to the HTML table)
    var table_elt = document.getElementById("my-table-id");

    // Extract Data (create a workbook object from the table)
    var workbook = XLSX.utils.table_to_book(table_elt);

    // Process Data (add a new row)
    var ws = workbook.Sheets["Sheet1"];
    XLSX.utils.sheet_add_aoa(ws, [["Created " + new Date().toISOString()]], {
      origin: -1,
    });

    // Package and Release Data (`writeFile` tries to write and save an XLSB file)
    XLSX.writeFile(workbook, "Report.xlsb");
  };

  const sortMasterList = (key) => {
    setDataTable([]);
    let sortedData = [];

    if (refSort.current.key === key) {
      refSort.current.ascending = !refSort.current.ascending;
    } else {
      refSort.current.key = key;
      refSort.current.ascending = true;
    }

    sortedData = refSort.current.ascending
      ? key === "wipQty"
        ? dataTable.sort((a, b) => a[key] - b[key]) ||
          dataTable.sort((a, b) => a[key].localeCompare(b["mohId"]))
        : dataTable.sort((a, b) => a[key].localeCompare(b[key])) ||
          dataTable.sort((a, b) => a[key].localeCompare(b["mohId"]))
      : key === "wipQty"
      ? dataTable.sort((a, b) => b[key] - a[key]) ||
        dataTable.sort((a, b) => a[key].localeCompare(b["mohId"]))
      : dataTable.sort((a, b) => b[key].localeCompare(a[key])) ||
        dataTable.sort((a, b) => a[key].localeCompare(b["mohId"]));

    setTimeout(() => {
      setDataTable(sortedData);
    }, 0);
  };

  useEffect(() => {
    getWips();
  }, [wcs]);

  useEffect(() => {
    setFields(["mohId", "item", "wipQty", "user", "lastUpdate"]);
  }, []);
  useEffect(() => {
    setDataTable(data);
  }, [data]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <button onClick={() => setWcs(!wcs)}>Toggle</button>
        <button id="btn-Excel" onClick={scrapeData}>
          Download Excel File
        </button>
      </div>
      <div
        style={{
          maxHeight: "80vh",
          overflowY: "scroll",
          border: "1px solid black",
          marginTop: "10px",
        }}
      >
        <table
          // ref={tableRef}
          id="my-table-id"
          style={{
            color: "black",
            backgroundColor: "whitesmoke",
            width: "900px",
          }}
        >
          {data.length > 0 && (
            <>
              {/* <thead>
              <tr>
                {Object.keys(data[0]).map((key) => {
                  if (fields.includes(key)) {
                    return <th key={uid()}>{key}</th>;
                  }
                })}
              </tr>
            </thead> */}
              <tbody>
                <tr
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "lightblue",
                  }}
                >
                  {Object.keys(data[0]).map((key) => {
                    if (fields.includes(key)) {
                      return (
                        <td
                          key={uid()}
                          onClick={() => {
                            sortMasterList(key);
                          }}
                        >
                          {key}
                        </td>
                      );
                    }
                  })}
                </tr>

                {dataTable.map((item, index) => {
                  const keyToUse = refSort.current.key;
                  if (refInsertRow.current === true) {
                    refTotalWip.current = refTempQty.current;
                  }

                  if (
                    index > 0 &&
                    (keyToUse === "mohId" || keyToUse === "item")
                  ) {
                    if (refValue.current !== item[keyToUse]) {
                      refValue.current = item[keyToUse];
                      refTempQty.current = item.wipQty;
                      refInsertRow.current = true;
                    } else {
                      // correct
                      refInsertRow.current = false;
                      refTotalWip.current = refTotalWip.current + item.wipQty;
                    }
                  } else {
                    // correct
                    refValue.current = item[keyToUse];
                    refInsertRow.current = false;
                    refTotalWip.current = item.wipQty;
                  }
                  console.log(index, refTotalWip.current);
                  // console.log("refTotalWip.current");
                  // console.log(refTotalWip.current);
                  return (
                    <React.Fragment key={index}>
                      {refInsertRow.current && (
                        <tr
                          style={{
                            border: "2px solid red",
                            color: "blue",
                          }}
                        >
                          <td
                            colSpan={2}
                            style={{
                              textAlign: "right",
                              textDecoration: "underline",
                            }}
                          >
                            {keyToUse === "mohId" ? "" : "TOTAL"}
                          </td>
                          <td style={{ textDecoration: "underline" }}>
                            {keyToUse === "mohId"
                              ? ""
                              : refTotalWip.current.toFixed(2)}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      )}

                      <tr key={index}>
                        {Object.keys(item).map((key3, index) => {
                          let lastUpdate = "";
                          if (key3 === "lastUpdate") {
                            const dt = new Date(Date.parse(item[key3]));
                            lastUpdate = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
                          }
                          if (fields.includes(key3)) {
                            return (
                              <td key={index}>
                                {typeof item[key3] === "boolean"
                                  ? item[key3].toString()
                                  : typeof item[key3] === "number"
                                  ? item[key3].toFixed(2)
                                  : key3 === "lastUpdate"
                                  ? lastUpdate
                                  : item[key3]}
                              </td>
                            );
                          }
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
                {refSort.current.key === "item" && (
                  <tr
                    style={{
                      border: "2px solid red",
                      color: "blue",
                    }}
                  >
                    <td
                      colSpan={2}
                      style={{
                        textAlign: "right",
                        textDecoration: "underline",
                      }}
                    >
                      {"TOTAL"}
                    </td>
                    <td style={{ textDecoration: "underline" }}>
                      {refInsertRow.current
                        ? refTempQty.current.toFixed(2)
                        : refTotalWip.current.toFixed(2)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                )}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  );
}

export default App;
