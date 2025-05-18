import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  getDimensions,
  getMeasures,
  getHierarchies,
  drillDown,
  rollUp,
  slice,
  dice,
  pivot
} from '../services/olap/olapService';

interface Dimension {
  dimension: string;
}

interface Measure {
  measure: string;
  unit: string;
}

interface Hierarchy {
  dimension: string;
  level: string;
  child: string | null;
}

interface Filter {
  dimension: string;
  value: string | number;
}

interface OlapResult {
  [key: string]: any;
}

// Tạm thời tạo các component tabs đơn giản
const TabsList: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
  <div className={`flex space-x-2 ${className}`}>
    {children}
  </div>
);

const TabsTrigger: React.FC<{children: React.ReactNode, value: string, className?: string, onClick?: () => void}> = 
  ({ children, value, className = '', onClick }) => (
    <button 
      className={`px-4 py-2 ${className}`} 
      data-value={value}
      onClick={onClick}
    >
      {children}
    </button>
  );

const TabsContent: React.FC<{children: React.ReactNode, value: string}> = 
  ({ children, value }) => <div data-content={value}>{children}</div>;

const Tabs: React.FC<{children: React.ReactNode, defaultValue: string}> = 
  ({ children, defaultValue }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    
    // Xác định các trigger và content từ children
    const childrenArray = React.Children.toArray(children);
    const triggers = childrenArray.filter((child: any) => child.type === TabsList);
    const contents = childrenArray.filter((child: any) => child.type === TabsContent);
    
    // Thêm xử lý click cho các trigger
    const triggersWithClick = React.cloneElement(triggers[0], {}, 
      React.Children.map(triggers[0].props.children, (child: any) => {
        return React.cloneElement(child, {
          className: child.props['data-value'] === activeTab 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted',
          onClick: () => setActiveTab(child.props.value)
        });
      })
    );
    
    // Chỉ hiển thị content active
    const visibleContent = contents.find((child: any) => 
      child.props.value === activeTab
    );
    
    return (
      <div>
        {triggersWithClick}
        <div className="mt-4">
          {visibleContent}
        </div>
      </div>
    );
  };

const OlapExplorer: React.FC = () => {
  const [dimensions, setDimensions] = useState<string[]>([]);
  const [measures, setMeasures] = useState<string[]>([]);
  const [hierarchies, setHierarchies] = useState<{[key: string]: {level: string, child: string | null}[]}>({});
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sliceDimension, setSliceDimension] = useState<string>('');
  const [sliceValue, setSliceValue] = useState<string>('');
  const [diceFilters, setDiceFilters] = useState<{dimension: string, value: string}[]>([]);
  const [tempDiceFilter, setTempDiceFilter] = useState<{dimension: string, value: string}>({dimension: '', value: ''});
  const [pivotRow, setPivotRow] = useState<string>('');
  const [pivotColumn, setPivotColumn] = useState<string>('');
  const [pivotResults, setPivotResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const dimensionsData = await getDimensions();
        const measuresData = await getMeasures();
        const hierarchiesData = await getHierarchies();

        setDimensions(Array.isArray(dimensionsData) ? dimensionsData : []);
        setMeasures(Array.isArray(measuresData) ? measuresData : []);
        
        if (typeof hierarchiesData === 'object' && !Array.isArray(hierarchiesData)) {
          setHierarchies(hierarchiesData);
          
          if (Object.keys(hierarchiesData).length > 0) {
            const firstDim = Object.keys(hierarchiesData)[0];
            setSelectedDimension(firstDim);
            
            if (hierarchiesData[firstDim]?.length > 0) {
              setSelectedLevel(hierarchiesData[firstDim][0]?.level || '');
            }
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching OLAP metadata:', err);
        setError('Không thể tải metadata OLAP. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const handleDrillDown = async () => {
    if (!selectedDimension || !selectedLevel) return;
    
    setLoading(true);
    try {
      const data = await drillDown(selectedDimension, selectedLevel, selectedValue);
      setResult(Array.isArray(data) ? data : []);
      
      if (hierarchies[selectedDimension]) {
        const currentLevelIndex = hierarchies[selectedDimension].findIndex(h => h.level === selectedLevel);
        if (currentLevelIndex >= 0 && currentLevelIndex < hierarchies[selectedDimension].length - 1) {
          setSelectedLevel(hierarchies[selectedDimension][currentLevelIndex + 1].level);
        }
      }
    } catch (error) {
      console.error('Lỗi drill down:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollUp = async () => {
    if (!selectedDimension || !selectedLevel) return;
    
    setLoading(true);
    try {
      const data = await rollUp(selectedDimension, selectedLevel);
      setResult(Array.isArray(data) ? data : []);
      
      if (hierarchies[selectedDimension]) {
        const currentLevelIndex = hierarchies[selectedDimension].findIndex(h => h.level === selectedLevel);
        if (currentLevelIndex > 0) {
          setSelectedLevel(hierarchies[selectedDimension][currentLevelIndex - 1].level);
        }
      }
    } catch (error) {
      console.error('Lỗi roll up:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlice = async () => {
    if (!sliceDimension || !sliceValue) return;
    
    setLoading(true);
    try {
      const data = await slice(sliceDimension, sliceValue);
      setResult(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi slice:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDiceFilter = () => {
    if (!tempDiceFilter.dimension || !tempDiceFilter.value) return;
    
    setDiceFilters([...diceFilters, tempDiceFilter]);
    setTempDiceFilter({dimension: '', value: ''});
  };

  const removeDiceFilter = (index: number) => {
    setDiceFilters(diceFilters.filter((_, i) => i !== index));
  };

  const handleDice = async () => {
    if (diceFilters.length === 0) return;
    
    setLoading(true);
    try {
      const data = await dice({filters: diceFilters});
      setResult(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi dice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePivot = async () => {
    if (!pivotRow || !pivotColumn) return;
    
    setLoading(true);
    try {
      const data = await pivot({
        rows: [pivotRow],
        columns: [pivotColumn],
        measures: ['total_sold'],
        filters: diceFilters.length > 0 ? diceFilters : undefined
      });
      
      setPivotResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi pivot:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelsForSelectedDimension = () => {
    if (!selectedDimension || !hierarchies[selectedDimension]) return [];
    return hierarchies[selectedDimension].map(h => h.level);
  };

  const renderResultTable = () => {
    if (result.length === 0) return <p className="text-muted-foreground">Chưa có dữ liệu. Hãy thực hiện một thao tác.</p>;
    
    const columns = Object.keys(result[0]);
    
    return (
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((column, index) => (
                <th key={index} className="p-2 text-left">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex < result.length - 1 ? 'border-b' : ''}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-2">{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPivotTable = () => {
    if (pivotResults.length === 0) return <p className="text-muted-foreground">Chưa có dữ liệu pivot. Hãy thực hiện thao tác pivot.</p>;
    
    const uniqueRowValues = [...new Set(pivotResults.map(item => item.row_value))];
    const uniqueColValues = [...new Set(pivotResults.map(item => item.col_value))];
    
    return (
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">{pivotRow}/{pivotColumn}</th>
              {uniqueColValues.map((col, index) => (
                <th key={index} className="p-2 text-right">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uniqueRowValues.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex < uniqueRowValues.length - 1 ? 'border-b' : ''}>
                <td className="p-2 font-medium">{row}</td>
                {uniqueColValues.map((col, colIndex) => {
                  const cell = pivotResults.find(item => item.row_value === row && item.col_value === col);
                  return (
                    <td key={colIndex} className="p-2 text-right">
                      {cell ? cell.total_sold : 0}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading && !result.length) {
    return <div className="flex justify-center items-center h-full">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">OLAP Explorer</h1>

      <Tabs defaultValue="drill">
        <TabsList className="mb-4">
          <TabsTrigger value="drill">Drill Down/Roll Up</TabsTrigger>
          <TabsTrigger value="slice">Slice</TabsTrigger>
          <TabsTrigger value="dice">Dice</TabsTrigger>
          <TabsTrigger value="pivot">Pivot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="drill">
          <Card>
            <CardHeader>
              <CardTitle>Drill Down / Roll Up</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Chiều</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedDimension}
                      onChange={(e) => {
                        setSelectedDimension(e.target.value);
                        if (hierarchies[e.target.value]?.length > 0) {
                          setSelectedLevel(hierarchies[e.target.value][0].level);
                        }
                      }}
                    >
                      <option value="">Chọn chiều...</option>
                      {dimensions.map((dim, index) => (
                        <option key={index} value={dim}>{dim}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cấp</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      disabled={!selectedDimension}
                    >
                      <option value="">Chọn cấp...</option>
                      {getLevelsForSelectedDimension().map((level, index) => (
                        <option key={index} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá trị (tùy chọn)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={selectedValue}
                      onChange={(e) => setSelectedValue(e.target.value)}
                      placeholder="Nhập giá trị cụ thể..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleDrillDown}
                    disabled={loading || !selectedDimension || !selectedLevel}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    Drill Down
                  </button>
                  <button
                    onClick={handleRollUp}
                    disabled={loading || !selectedDimension || !selectedLevel}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    Roll Up
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Kết quả</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">Đang tải...</div>
              ) : renderResultTable()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="slice">
          <Card>
            <CardHeader>
              <CardTitle>Slice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Chiều</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={sliceDimension}
                      onChange={(e) => setSliceDimension(e.target.value)}
                    >
                      <option value="">Chọn chiều...</option>
                      {dimensions.map((dim, index) => (
                        <option key={index} value={dim}>{dim}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá trị</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={sliceValue}
                      onChange={(e) => setSliceValue(e.target.value)}
                      placeholder="Nhập giá trị cần slice..."
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleSlice}
                  disabled={loading || !sliceDimension || !sliceValue}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Thực hiện Slice
                </button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Kết quả</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">Đang tải...</div>
              ) : renderResultTable()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dice">
          <Card>
            <CardHeader>
              <CardTitle>Dice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Chiều</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={tempDiceFilter.dimension}
                      onChange={(e) => setTempDiceFilter({...tempDiceFilter, dimension: e.target.value})}
                    >
                      <option value="">Chọn chiều...</option>
                      {dimensions.map((dim, index) => (
                        <option key={index} value={dim}>{dim}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá trị</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={tempDiceFilter.value}
                      onChange={(e) => setTempDiceFilter({...tempDiceFilter, value: e.target.value})}
                      placeholder="Nhập giá trị..."
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={addDiceFilter}
                      disabled={!tempDiceFilter.dimension || !tempDiceFilter.value}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
                    >
                      Thêm bộ lọc
                    </button>
                  </div>
                </div>
                
                {diceFilters.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Bộ lọc hiện tại:</h3>
                    <ul className="space-y-2">
                      {diceFilters.map((filter, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span>{filter.dimension}: {filter.value}</span>
                          <button
                            onClick={() => removeDiceFilter(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Xóa
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button
                  onClick={handleDice}
                  disabled={loading || diceFilters.length === 0}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Thực hiện Dice
                </button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Kết quả</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">Đang tải...</div>
              ) : renderResultTable()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pivot">
          <Card>
            <CardHeader>
              <CardTitle>Pivot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Hàng</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={pivotRow}
                      onChange={(e) => setPivotRow(e.target.value)}
                    >
                      <option value="">Chọn chiều cho hàng...</option>
                      {dimensions.map((dim, index) => {
                        if (hierarchies[dim]?.length > 0) {
                          return hierarchies[dim].map((level, levelIndex) => (
                            <option key={`${index}-${levelIndex}`} value={level.level}>
                              {dim} - {level.level}
                            </option>
                          ));
                        }
                        return <option key={index} value={dim}>{dim}</option>;
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cột</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={pivotColumn}
                      onChange={(e) => setPivotColumn(e.target.value)}
                    >
                      <option value="">Chọn chiều cho cột...</option>
                      {dimensions.map((dim, index) => {
                        if (hierarchies[dim]?.length > 0) {
                          return hierarchies[dim].map((level, levelIndex) => (
                            <option key={`${index}-${levelIndex}`} value={level.level}>
                              {dim} - {level.level}
                            </option>
                          ));
                        }
                        return <option key={index} value={dim}>{dim}</option>;
                      })}
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handlePivot}
                  disabled={loading || !pivotRow || !pivotColumn}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Thực hiện Pivot
                </button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Kết quả Pivot</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">Đang tải...</div>
              ) : renderPivotTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OlapExplorer;