export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex w-screen min-h-screen dark flex-col items-center justify-center">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-red-400 inline-block text-transparent bg-clip-text">
          zkMeme
        </h1>
      </div>
      {children}
    </div>
  );
}
