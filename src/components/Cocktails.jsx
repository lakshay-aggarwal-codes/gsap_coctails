import {useEffect, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {fetchCocktails} from "../services/api.js";

const Cocktails = () => {
    const [popularList, setPopularList] = useState([]);
    const [lovedList, setLovedList] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        fetchCocktails()
            .then((data) => {
                if (!isMounted) return;
                // These two lists reconstruct the original "Most popular" /
                // "Most loved" split (cocktailLists / mockTailLists). The
                // `price` check excludes Menu carousel entries, which share
                // the same category values but don't have a price field.
                setPopularList(data.filter((c) => c.category === "cocktail" && c.price));
                setLovedList(data.filter((c) => c.category === "mocktail" && c.price));
            })
            .catch((err) => {
                if (isMounted) setError(err.message);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useGSAP(() => {
        const parallaxTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#cocktails",
                start: 'top 30%',
                end: "bottom 80%",
                scrub: true,
            }
        })
        parallaxTimeline.from("#c-left-leaf", {
            x: -100,
            y: 100,
        })
            .from("#c-right-leaf", {
                x: 100,
                y: 100,
            })
    })

    return (
        <section id='cocktails' className='noisy'>
            <img src='/images/cocktail-left-leaf.png' alt='left-leaf' id='c-left-leaf'/>
            <img src='/images/cocktail-right-leaf.png' alt='right-leaf' id='c-right-leaf'/>

            {error && (
                <p className='text-center text-red-400'>Unable to load cocktails: {error}</p>
            )}

            <div className='list'>
                <div className='popular'>
                    <h2>Most populer cocktails:</h2>
                    <ul>
                        {popularList.map(({_id, name, country, detail, price}) => (
                            <li key={_id}>
                                <div className='md:me-28'>
                                    <h3>{name}</h3>
                                    <p>{country} | {detail}</p>
                                </div>
                                <span>- {price}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className='loved'>
                    <h2>Most loved cocktails:</h2>
                    <ul>
                        {lovedList.map(({_id, name, country, detail, price}) => (
                            <li key={_id}>
                                <div className='me-28'>
                                    <h3>{name}</h3>
                                    <p>{country} | {detail}</p>
                                </div>
                                <span>- {price}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}
export default Cocktails
