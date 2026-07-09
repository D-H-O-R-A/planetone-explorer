
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NetworkChart from "@/components/NetworkChart";
import { MotionContainer, MotionChild } from "@/components/ui/motion-container";

const ChartsPage = () => {
  return (
    <MotionContainer className="min-h-screen px-4 md:px-8 py-8">
      <div className="container mx-auto">
        <MotionChild>
          <h1 className="text-2xl md:text-3xl font-bold mb-6 gradient-text">Network Analytics</h1>
        </MotionChild>
        
        <div className="grid grid-cols-1 gap-8">
          <MotionChild delay={0.1}>
            <NetworkChart />
          </MotionChild>
          
          <MotionChild delay={0.2}>
            <Card className="section-transition bg-black/20 border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl text-white">Transaction Volume</CardTitle>
              </CardHeader>
              <CardContent className="h-60 md:h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Advanced charts will be displayed here</p>
              </CardContent>
            </Card>
          </MotionChild>
          
          <MotionChild delay={0.3}>
            <Card className="section-transition bg-black/20 border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl text-white">Network Activity</CardTitle>
              </CardHeader>
              <CardContent className="h-60 md:h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Advanced charts will be displayed here</p>
              </CardContent>
            </Card>
          </MotionChild>
        </div>
      </div>
    </MotionContainer>
  );
};

export default ChartsPage;
