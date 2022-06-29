import { memo } from "react";
import {
  BrowserRouter,
  Routes as ReactRouterRoutes,
  Route,
} from "react-router-dom";
import Custom404 from "./Custom404";
import Profile from "./Profile";
import Signin from "./Signin";
import Signup from "./Signup";

function Routes() {
  return (
    <BrowserRouter>
      <ReactRouterRoutes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/:userId" element={<Profile />}>
          <Route path="follow" element={<></>} />
        </Route>
        <Route path="/collection/:collectionId" element={<></>} />
        <Route path="/item/:itemId" element={<></>} />
        {/* recommend */}
        {/* search */}
        <Route path="*" element={<Custom404 />} />
      </ReactRouterRoutes>
    </BrowserRouter>
  );
}

export default memo(Routes);
