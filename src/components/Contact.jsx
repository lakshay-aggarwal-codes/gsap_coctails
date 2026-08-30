import {openingHours, socials} from "../constants/index.js";
import {useState} from "react";
import {useGSAP} from "@gsap/react";
import {SplitText} from "gsap/all";
import gsap from "gsap";
import {sendContactMessage} from "../services/api.js";
const Contact = () => {
    const [formData, setFormData] = useState({name: "", email: "", message: ""});
     const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        try {
            await sendContactMessage(formData);
            setStatus("success");
            setFormData({name: "", email: "", message: ""});
        } catch (err) {
            setStatus("error");
            setErrorMessage(err.message);
        }
    };

    useGSAP(()=>{
        const titleSplit = SplitText.create("#contact h2",{
            type:'words'
        });
        const timeline = gsap.timeline({
            scrollTrigger:{
                trigger:"#contact",
                start:"top center",
            },
            ease :"power1.inOut",
        })
        timeline
            .from(titleSplit.words,{
                opacity:0,
                yPercent:100,
                stagger:0.02
            })
            .from("#contact h3,#contact p",{
                opacity:0,
                yPercent:100,
                stagger:0.02
            })
            .to('#f-right-leaf',{
                y:'-50', duration:1,ease:'power1.inOut',scrub:true,
            })
            .to('#f-left-leaf',{
                y:'-50', duration:1,ease:'power1.inOut',scrub:true,
            },'<')
    })
    return (
        <footer id='contact'>
            <img src='/images/footer-right-leaf.png' alt='right leaf' id='f-right-leaf'/>
            <img src='/images/footer-left-leaf.png' alt='left leaf' id='f-left-leaf'/>

            <div className='content'>
                <h2>Where to find us</h2>
                <div>
                    <h3>Visit Our Bar</h3>
                    <p>Mojito House
                        24, Connaught Place
                        New Delhi, India — 110001</p>
                </div>
                <div>
                    <h3>Contact Us</h3>
                    <p>+91 98765 43210</p>
                    <p>hello@mojitohouse.com</p>
                </div>
                <div>
                    <h3>Open Everyday</h3>
                    {openingHours.map((time) => (
                        <p key={time.day}>
                            {time.day} : {time.time}
                        </p>
                    ))}
                </div>

                <div>
                    <h3>Socials</h3>
                    <div className='flex-center gap-5'>
                        {socials.map((social) => (
                            <a href={social.url}
                               key={social.name}
                               target={'_blank'}
                               rel={'noopener noreferrer'}
                               aria-label={social.name}>
                                <img src={social.icon} alt={social.icon}/>
                            </a>
                        ))}
                    </div>
                </div>

                <div className='w-full max-w-md ms-auto text-left'>
                    <h3>Send Us a Message</h3>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <input
                            type='text'
                            name='name'
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder='Your name'
                            aria-label='Your name'
                            className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow'
                        />
                        <input
                            type='email'
                            name='email'
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder='Your email'
                            aria-label='Your email'
                            className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow'
                        />
                        <textarea
                            name='message'
                            rows='4'
                            required
                            value={formData.message}
                            onChange={handleChange}
                            placeholder='How can we help?'
                            aria-label='Your message'
                            className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow'
                        />
                        <button
                            type='submit'
                            disabled={status === "submitting"}
                            className='rounded-full bg-yellow text-black font-semibold px-6 py-3 hover:opacity-90 transition disabled:opacity-50'
                        >
                            {status === "submitting" ? "Sending..." : "Send Message"}
                        </button>
                        {status === "success" && (
                            <p className='text-green-400'>Thanks! We'll get back to you soon.</p>
                        )}
                        {status === "error" && (
                            <p className='text-red-400'>Something went wrong: {errorMessage}</p>
                        )}
                    </form>
                </div>
            </div>
        </footer>
    )
}
export default Contact;