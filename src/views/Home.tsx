"use client";

import Hero from "../components/Hero";
import Trending from "../components/Trending";
import Category from "../components/Category";
import ExploreCollection from "../components/ExploreCollection";

function Home() {
  return (
    <div className="bg-[#fcfcfb]">
      <Hero />
      <Category />
      <Trending />
      <ExploreCollection />
    </div>
  );
}

export default Home;
