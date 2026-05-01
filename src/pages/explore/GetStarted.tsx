import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

import type { JSX } from 'react';

export default function GetStarted(): JSX.Element {
  const { isLoading } = useAuthStore();

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-night flex items-center justify-center">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8 text-platinum/60">
          <circle cx="4" cy="12" r="3">
            <animate
              id="spinner_qFRN"
              begin="0;spinner_OcgL.end+0.25s"
              attributeName="cy"
              calcMode="spline"
              dur="0.6s"
              values="12;6;12"
              keySplines=".33,.66,.66,1;.33,0,.66,.33"
            />
          </circle>
          <circle cx="12" cy="12" r="3">
            <animate
              begin="spinner_qFRN.begin+0.1s"
              attributeName="cy"
              calcMode="spline"
              dur="0.6s"
              values="12;6;12"
              keySplines=".33,.66,.66,1;.33,0,.66,.33"
            />
          </circle>
          <circle cx="20" cy="12" r="3">
            <animate
              id="spinner_OcgL"
              begin="spinner_qFRN.begin+0.2s"
              attributeName="cy"
              calcMode="spline"
              dur="0.6s"
              values="12;6;12"
              keySplines=".33,.66,.66,1;.33,0,.66,.33"
            />
          </circle>
        </svg>
      </div>
    );
  }

  return (
    <main className="flex justify-center py-10 bg-night overflow-y-scroll [scrollbar-width:none]">
      <div className="flex flex-col justify-between min-h-full w-full gap-6 xs:max-w-90 s:max-w-97.5 s-medium:max-w-112.5 px-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-extrabold text-5xl text-platinum tracking-tight leading-none">
            iYou
          </h1>
          <span className="text-platinum/40 font-bold tracking-widest uppercase">Messenger</span>
        </div>
        <div className="flex flex-col gap-8">
          {[
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-6.5 ">
                  <path
                    fill="currentColor"
                    d="M64 96L64 512L192 512L192 608L352 512L576 512L576 96L64 96zM184 272L336 272L336 320L160 320L160 272L184 272zM408 272L480 272L480 320L384 320L384 272L408 272zM184 368L256 368L256 416L160 416L160 368L184 368zM328 368L480 368L480 416L304 416L304 368L328 368z"
                  />
                </svg>
              ),
              title: 'Real-time Chat',
              desc: 'Send messages, share media, and stay connected instantly. Experience seamless, lag-free communication with anyone, anywhere in the world.',
            },
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="size-6 fill-platinum/85"
                >
                  <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z" />
                </svg>
              ),
              title: 'Group Conversations',
              desc: 'Create interactive groups, invite your closest friends, and engage in lively discussions with your favorite communities all in one place.',
            },
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                  className="size-5.5"
                >
                  <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" />
                </svg>
              ),
              title: 'Stories',
              desc: 'Capture and share your daily moments through photos and text updates that automatically disappear after 24 hours.',
            },
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                  className="size-6"
                >
                  <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.1V447.1c150.3-75.3 177.3-231.1 177.6-302.3L256 66.1z" />
                </svg>
              ),
              title: 'Privacy First',
              desc: 'Take full control of your account. Customize your preferences to manage Read Receipts, Hide Profile, Story Receipts, and your Last Seen status.',
            },
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  fill="currentColor"
                  className="size-7"
                >
                  <path d="M482.4 221.9C517.7 213.6 544 181.9 544 144C544 99.8 508.2 64 464 64C420.6 64 385.3 98.5 384 141.5L200.2 215.1C185.7 200.8 165.9 192 144 192C99.8 192 64 227.8 64 272C64 316.2 99.8 352 144 352C156.2 352 167.8 349.3 178.1 344.4L323.7 471.8C321.3 479.4 320 487.6 320 496C320 540.2 355.8 576 400 576C444.2 576 480 540.2 480 496C480 468.3 466 443.9 444.6 429.6L482.4 221.9zM220.3 296.2C222.5 289.3 223.8 282 224 274.5L407.8 201C411.4 204.5 415.2 207.7 419.4 210.5L381.6 418.1C376.1 419.4 370.8 421.2 365.8 423.6L220.3 296.2z" />
                </svg>
              ),
              title: 'Connect Easily',
              desc: 'Keep your personal phone number completely private. Easily add new friends using a personalized PIN or your unique username.',
            },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4">
              <div className="size-12 shrink-0 flex justify-center items-center rounded-2xl bg-dark-deep border border-ebony-light text-platinum/80">
                {f.icon}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-platinum/85 leading-tight">{f.title}</span>
                <span className="text-[0.85rem] leading-snug text-platinum/50">{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="h-13 w-full flex justify-center items-center rounded-2xl bg-platinum/85 font-bold text-dark-charcoal text-[1.05rem] hover:cursor-pointer active:scale-95 transition-transform"
          >
            Get Started
          </button>
          <div className="flex justify-center gap-1 text-sm text-platinum/40">
            <span>Already have an account?</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-platinum/60 hover:underline hover:cursor-pointer"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
