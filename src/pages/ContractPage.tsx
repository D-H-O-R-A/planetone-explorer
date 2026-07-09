
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, shortenHash } from "@/utils/formatter";
import { Copy, Play, Code, History, FileCode, Terminal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { MotionContainer, MotionChild } from "@/components/ui/motion-container";
import { fetchContractDetails, invokeSmartContract, ContractDetails } from "@/services/api";

const ContractPage = () => {
  const { address } = useParams<{ address: string }>();
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [functionParams, setFunctionParams] = useState<Record<string, string>>({});
  const [isInvoking, setIsInvoking] = useState(false);
  const [invocationResult, setInvocationResult] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadContractDetails = async () => {
      if (!address) return;
      
      setIsLoading(true);
      try {
        const data = await fetchContractDetails(address);
        if (!data) {
          throw new Error("Contract not found or has no script");
        }
        
        setContract(data);
        
        if (data.functions.length > 0) {
          setSelectedFunction(data.functions[0].name);
          
          // Initialize params
          const initialParams: Record<string, string> = {};
          data.functions[0].params.forEach(param => {
            initialParams[param.name] = "";
          });
          setFunctionParams(initialParams);
        }
      } catch (error) {
        console.error("Error loading contract details:", error);
        toast({
          title: "Error",
          description: "Failed to load contract details from the blockchain",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContractDetails();
  }, [address, toast]);

  const handleFunctionChange = (functionName: string) => {
    setSelectedFunction(functionName);
    
    if (contract) {
      const func = contract.functions.find(f => f.name === functionName);
      if (func) {
        const newParams: Record<string, string> = {};
        func.params.forEach(param => {
          newParams[param.name] = "";
        });
        setFunctionParams(newParams);
      }
    }
    
    setInvocationResult(null);
  };

  const handleParamChange = (paramName: string, value: string) => {
    setFunctionParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleInvoke = async () => {
    if (!address || !selectedFunction) return;
    
    setIsInvoking(true);
    setInvocationResult(null);
    
    try {
      // Use the functionParams object directly since the API has been updated to accept this type
      const result = await invokeSmartContract(address, selectedFunction, functionParams);
      
      setInvocationResult(JSON.stringify(result, null, 2));
      
      toast({
        title: "Success",
        description: "Contract function invocation prepared successfully",
      });
    } catch (error) {
      console.error("Error invoking contract:", error);
      toast({
        title: "Error",
        description: "Failed to invoke contract function",
        variant: "destructive",
      });
      setInvocationResult(JSON.stringify({ error: "Invocation failed" }, null, 2));
    } finally {
      setIsInvoking(false);
    }
  };

  return (
    <MotionContainer className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : contract ? (
        <>
          <MotionChild>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold gradient-text">Contract</h1>
                <Badge variant={contract.type === "dApp" ? "default" : "secondary"} className={contract.type === "dApp" ? "bg-primary/80" : "bg-primary/20"}>
                  {contract.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-lg text-primary">{address}</code>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(address || "")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-muted-foreground">
                Deployed by {shortenHash(contract.deployer)} on {formatDate(contract.deployTime)}
              </div>
            </div>
          </MotionChild>

          <MotionChild delay={0.1}>
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Source Code
                </TabsTrigger>
                <TabsTrigger value="functions" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Functions
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Call History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="code">
                <Card className="glass-card">
                  <CardHeader className="border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="h-5 w-5 text-primary" />
                      Contract Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="bg-black/50 p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
                      <code className="text-white text-sm font-mono whitespace-pre-wrap">
                        {contract.sourceCode || "Unable to decompile contract source code"}
                      </code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="functions">
                <Card className="glass-card">
                  <CardHeader className="border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-primary" />
                      Callable Functions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {contract.functions.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Select Function</Label>
                            <div className="flex flex-wrap gap-2">
                              {contract.functions.map((func) => (
                                <Button
                                  key={func.name}
                                  variant={selectedFunction === func.name ? "default" : "outline"}
                                  onClick={() => handleFunctionChange(func.name)}
                                  className={selectedFunction === func.name ? "bg-primary text-white" : ""}
                                >
                                  {func.name}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {selectedFunction && (
                            <div className="space-y-4">
                              <h3 className="text-lg font-bold">{selectedFunction}</h3>
                              
                              {contract.functions.find(f => f.name === selectedFunction)?.params.map((param) => (
                                <div key={param.name} className="space-y-2">
                                  <Label>
                                    {param.name} <span className="text-muted-foreground text-xs">({param.type})</span>
                                  </Label>
                                  <Input
                                    placeholder={`Enter ${param.name}`}
                                    value={functionParams[param.name] || ""}
                                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                                  />
                                </div>
                              ))}
                              
                              <Button
                                onClick={handleInvoke}
                                disabled={isInvoking}
                                className="w-full bg-primary hover:bg-primary/90"
                              >
                                {isInvoking ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Invoking...
                                  </div>
                                ) : (
                                  <>Invoke {selectedFunction}</>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="border border-primary/10 rounded-lg p-4 bg-black/20">
                          <h3 className="text-sm font-bold mb-2 text-muted-foreground">Execution Result</h3>
                          <pre className="text-white font-mono text-xs whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                            {invocationResult || "No results yet. Invoke a function to see results here."}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        This contract has no callable functions
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card className="glass-card">
                  <CardHeader className="border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Recent Calls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/30">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                              Function
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                              Caller
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                              Parameters
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                              Result
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                          {contract.lastCalls.length > 0 ? (
                            contract.lastCalls.map((call) => (
                              <tr key={call.txId} className="hover:bg-primary/5">
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  {formatDate(call.timestamp)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary">
                                  {call.function}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  {shortenHash(call.caller)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <pre className="text-xs overflow-x-auto max-w-xs">
                                    {JSON.stringify(call.params, null, 2)}
                                  </pre>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <pre className="text-xs overflow-x-auto max-w-xs">
                                    {call.result}
                                  </pre>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                No call history available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </MotionChild>
        </>
      ) : (
        <MotionChild>
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
            <p className="text-muted-foreground">The requested contract could not be found or is not accessible</p>
          </div>
        </MotionChild>
      )}
    </MotionContainer>
  );
};

export default ContractPage;
