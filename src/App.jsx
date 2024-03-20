import { useEffect, useRef, useState } from "react";
import { uid } from "uid";
import * as XLSX from "xlsx";
import "./App.css";
import { getInventoryWips } from "./api/wip/getInventoryWips";

function App() {
  const [data, setData] = useState([]);
  const [dataTable, setDataTable] = useState([]);
  const [fields, setFields] = useState([]);
  const refSort = useRef({ key: "mohId", ascending: true });
  const getWips = async () => {
    const wips = await getInventoryWips();
    setData(wips.data);
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
  }, []);

  useEffect(() => {
    setFields(["mohId", "item", "wipQty", "user", "lastUpdate"]);
  }, []);
  useEffect(() => {
    setDataTable(data);
  }, [data]);

  return (
    <div>
      <button id="btn-Excel" onClick={scrapeData}>
        Download Excel File
      </button>
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
                  return (
                    <tr key={index}>
                      {Object.keys(item).map((key3, index) => {
                        if (fields.includes(key3)) {
                          return (
                            <td key={index}>
                              {typeof item[key3] === "boolean"
                                ? item[key3].toString()
                                : typeof item[key3] === "number"
                                ? item[key3].toFixed(2)
                                : key3 === "lastUpdate"
                                ? item[key3]
                                : item[key3]}
                            </td>
                          );
                        }
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  );
}

export default App;
