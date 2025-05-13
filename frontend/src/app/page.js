import Image from "next/image";

import Sidebar from "@/components/Sidebar";
import Bliss from "@/components/Bliss"
import Inhibition from "@/components/Inhibition";
import BlissContour from "@/components/BlissContour";

export default function Home() {
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main>
        <div className="flex">
          <div className="basis-full">
            <Inhibition/>
            <BlissContour/>
            <Bliss/>
          </div>
          <div className="basis-64">
            <Sidebar/>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
