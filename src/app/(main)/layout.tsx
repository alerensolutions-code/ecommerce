import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Box } from "@mui/material";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
