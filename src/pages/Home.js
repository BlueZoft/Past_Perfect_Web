import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import ReactPaginate from "react-paginate"
import axios from "axios"
import Hero from "../components/Hero"
import HeroImg from "../assets/hero.jpg"
import decoHero from "../assets/deco.svg"
import { Puff } from "react-loader-spinner"

const Home = ({ title, setPage, page, sortedPrice, range, searchQuery }) => {
	const [data, setData] = useState()
	const [isLoading, setIsLoading] = useState(true)
	const [pageCount, setPageCount] = useState(1)
	const limit = 10

	const handlePageClick = (event) => {
		setPage(event.selected + 1)
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(`http://localhost:3001/offers`);
				setPageCount(Math.ceil(Number(response.data.count) / limit));
				const offersWithFirstImage = response.data.offers.map(offer => ({
					...offer,
					displayImage: offer.product_images.length > 0 ? offer.product_images[0].url : null // Check if product_images is not empty
				}));
				setData({ ...response.data, offers: offersWithFirstImage });
				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}
		fetchData()
	}, [page])

	return isLoading ? (
		<div>
			<Puff
				height="80"
				width="80"
				radisu={1}
				color="#2cb1ba"
				ariaLabel="puff-loading"
				wrapperStyle={{}}
				wrapperClass="puff-loader"
				visible={true}
			/>
		</div>
	) : (
		<>
			<Hero HeroImg={HeroImg} decoHero={decoHero} />
			<div className=" container">
				<h1 className="offers-title">Suggestions for you :</h1>
				<div className="offers">
					{data.offers.map((offer) => {
						return (
							<Link key={offer._id} to={`/offer/${offer._id}`}>
								<div className="card-container">
									<div className="offers-owner">
										{offer.owner.account.avatar && (
											<span className="offers-owner-avatar">
												<img
													style={{
														height: 25,
														borderRadius: 50,
													}}
													src={offer.owner.account.avatar.secure_url}
													alt=""
												/>
											</span>
										)}

										<span className="offers-owner-username">
											{offer.owner.account.username}
										</span>
									</div>

									<span className="offers-img-container">
										<img
											style={{ height: 400 }}
											src={offer.displayImage}
											alt={offer.product_name}
										/>
									</span>
									<div className="card">
										<h3 className="offers-name">{offer.product_name}</h3>
										<h2 className="offers-price">LKR {offer.product_price}</h2>
										{offer.product_details.map((item, index) => {
											return (
												<div key={index}>
													<span className="offers-title">{item.title}</span>
												</div>
											)
										})}

										<span>{offer.product_details.MARQUE}</span>
									</div>
								</div>
							</Link>
						)
					})}
				</div>

				<div className="pagination-container">
					<ReactPaginate
						previousLabel={"<"}
						nextLabel={">"}
						pageCount={pageCount}
						pageRangeDisplayed={2}
						onPageChange={handlePageClick}
						containerClassName={"pagination"}
						activeClassName={"active"}
						forcePage={page - 1} // return to the previous page if click on previous
					/>
				</div>
			</div>
		</>
	)
}

export default Home
