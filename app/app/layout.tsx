export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="grid w-screen h-screen place-content-center dark">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-red-400 inline-block text-transparent bg-clip-text">
          zkMeme
        </h1>
      </div>
      {children}
    </div>
  );
}
