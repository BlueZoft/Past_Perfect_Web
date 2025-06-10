import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import { Puff } from "react-loader-spinner"

const Offer = () => {
	const { id } = useParams()
	const [data, setData] = useState()
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState()

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(
					`http://localhost:3001/offer/${id}`
				)
				console.log("Fetched data:", response.data)
				setData(response.data)
			} catch (err) {
				setError(err.message)
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [id])

	if (error) return <div>Error: {error}</div>
	if (isLoading) return (
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
	)

	return (
		<div className="container">
			<div className="offer-container">
				<div className="offer-img">
					{data?.images?.[0] && <img src={data.images[0]} alt="" />}
				</div>
				<div className="offer-content">
					<div className="offer-content-first">
						<div className="offer-price"> LKR {data?.price}</div>
						<div className="offer-details">
							{data?.size && (
								<div>
									<ul className="offer-details-flex">
										<li>
											<span className="offer-details-key">Size</span>
											<span className="offer-details-value">{data.size}</span>
										</li>
									</ul>
								</div>
							)}
							{data?.condition && (
								<div>
									<ul className="offer-details-flex">
										<li>
											<span className="offer-details-key">Condition</span>
											<span className="offer-details-value">{data.condition}</span>
										</li>
									</ul>
								</div>
							)}
						</div>
					</div>
					<div className="offer-content-second">
						<div className="offer-name">{data?.title}</div>
						<div className="offer-desc">{data?.description}</div>
						<div className="offer-username">
							{/* Avatar implementation would go here if needed */}
							<div className="offer-owner">{data?.owner?.username}</div>
						</div>
					</div>
					<Link
						className="btn-offer"
						to="/payment"
						state={{ title: data?.title, price: data?.price }}
					>
						<button>Buy</button>
					</Link>
				</div>
			</div>
		</div>
	)
}

export default Offer
