import Header from "../Header";

export default function HeaderExample() {
  return (
    <Header
      userName="John Doe"
      onLogout={() => console.log("Logout clicked")}
    />
  );
}
