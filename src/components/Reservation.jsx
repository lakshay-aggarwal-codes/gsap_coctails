import {useState} from "react";
import {useGSAP} from "@gsap/react";
import {SplitText} from "gsap/all";
import gsap from "gsap";
import {createReservation} from "../services/api.js";
import {useCustomerAuth} from "../context/CustomerAuthContext.jsx";

const initialFormState = {
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    numberOfGuests: 2,
    specialRequest: "",
};

const ReservationForm = ({token, isAuthenticated, initialName, initialEmail}) => {
    const [formData, setFormData] = useState({
        ...initialFormState,
        name: initialName,
        email: initialEmail,
    });
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
            await createReservation(
                {
                    ...formData,
                    numberOfGuests: Number(formData.numberOfGuests),
                },
                token
            );
            setStatus("pending");
            setFormData(isAuthenticated ? {...initialFormState, name: initialName, email: initialEmail} : initialFormState);
        } catch (err) {
            setStatus("error");
            setErrorMessage(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='max-w-2xl mx-auto space-y-6'>
            <div className='grid md:grid-cols-2 gap-5'>
                <div>
                    <label htmlFor='name' className='block mb-2 text-sm'>Name</label>
                    <input
                        id='name'
                        name='name'
                        type='text'
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow'
                        placeholder='Jane Doe'
                    />
                </div>
                <div>
                    <label htmlFor='email' className='block mb-2 text-sm'>Email</label>
                    <input
                        id='email'
                        name='email'
                        type='email'
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow'
                        placeholder='jane@example.com'
                    />
                </div>
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
                <div>
                    <label htmlFor='phone' className='block mb-2 text-sm'>Phone</label>
                    <input
                        id='phone'
                        name='phone'
                        type='tel'
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow'
                        placeholder='+91 98765 43210'
                    />
                </div>
                <div>
                    <label htmlFor='numberOfGuests' className='block mb-2 text-sm'>Number of guests</label>
                    <input
                        id='numberOfGuests'
                        name='numberOfGuests'
                        type='number'
                        min='1'
                        required
                        value={formData.numberOfGuests}
                        onChange={handleChange}
                        className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow'
                    />
                </div>
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
                <div>
                    <label htmlFor='date' className='block mb-2 text-sm'>Date</label>
                    <input
                        id='date'
                        name='date'
                        type='date'
                        required
                        value={formData.date}
                        onChange={handleChange}
                        className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-yellow'
                    />
                </div>
                <div>
                    <label htmlFor='time' className='block mb-2 text-sm'>Time</label>
                    <input
                        id='time'
                        name='time'
                        type='time'
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-yellow'
                    />
                </div>
            </div>

            <div>
                <label htmlFor='specialRequest' className='block mb-2 text-sm'>Special request (optional)</label>
                <textarea
                    id='specialRequest'
                    name='specialRequest'
                    rows='3'
                    value={formData.specialRequest}
                    onChange={handleChange}
                    className='w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow'
                    placeholder='Window seat, birthday celebration, allergies, etc.'
                />
            </div>

            <button
                type='submit'
                disabled={status === "submitting"}
                className='w-full rounded-full bg-yellow text-black font-semibold py-3 hover:opacity-90 transition disabled:opacity-50'
            >
                {status === "submitting" ? "Submitting..." : "Reserve Now"}
            </button>

            {status === "pending" && (
                <p className='text-center text-green-400'>
                    Thanks! Your reservation request is in — we'll confirm it shortly.
                </p>
            )}
            {status === "error" && (
                <p className='text-center text-red-400'>
                    Something went wrong: {errorMessage}
                </p>
            )}
        </form>
    );
};

const Reservation = () => {
    const {token, customer, isAuthenticated} = useCustomerAuth();

    useGSAP(() => {
        const titleSplit = SplitText.create("#reservation h2", {type: "words"});
        gsap.timeline({
            scrollTrigger: {
                trigger: "#reservation",
                start: "top center",
            },
            ease: "power1.inOut",
        }).from(titleSplit.words, {
            opacity: 0,
            yPercent: 100,
            stagger: 0.02,
        });
    });

    return (
        <section id='reservation' className='min-h-screen py-28 2xl:px-0 px-5 container mx-auto'>
            <h2 className='text-5xl md:text-6xl font-modern-negra text-center mb-4'>
                Reserve a Table
            </h2>
            {isAuthenticated ? (
                <p className="text-center text-sm text-white-100/60 mb-8">
                    Booking as {customer?.name} — this will appear under My Reservations.
                </p>
            ) : (
                <div className="mb-8" />
            )}

            <ReservationForm
                key={customer?._id ?? (isAuthenticated ? "pending-auth" : "guest")}
                token={token}
                isAuthenticated={isAuthenticated}
                initialName={customer?.name || ""}
                initialEmail={customer?.email || ""}
            />
        </section>
    );
};

export default Reservation;
