import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bug from "../assets/bug.png";
import API from "../API/api";

export default function Bug() {
	const [showBug, setShowBug] = useState(false);
	const [title, setTitle] = useState("");
	const [problem, setProblem] = useState("");
	const [email, setEmail] = useState("");

	const send_problem = async (e) => {
		e.preventDefault();

		try {
			await API.post("/reports/", {
				title,
				problem,
				email,
			});

			setTitle("");
			setProblem("");
			setEmail("");
			setShowBug(false);
		} catch (error) {
			console.error(error);
		}
	};

	const itemVariants = {
		hidden: {
			opacity: 0,
			y: 15,
		},
		visible: {
			opacity: 1,
			y: 0,
		},
	};

	return (
		<>
			<div className="fixed bottom-4 right-4 z-50">
				<motion.img
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => setShowBug(true)}
					className="w-15 rounded-full cursor-pointer shadow-lg"
					src={bug}
					alt="Bug"
				/>
			</div>

			<AnimatePresence>
				{showBug && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
						onClick={() => setShowBug(false)}
					>
						<motion.div
							initial={{
								opacity: 0,
								scale: 0.9,
								y: 30,
							}}
							animate={{
								opacity: 1,
								scale: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								scale: 0.9,
								y: 30,
							}}
							transition={{
								duration: 0.25,
							}}
							onClick={(e) => e.stopPropagation()}
							className="bg-[#1a1f35] p-6 rounded-xl flex flex-col gap-4 w-full max-w-md shadow-2xl"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex gap-3">
									<img
										className="w-10 h-10 rounded-xl"
										src={bug}
										alt=""
									/>

									<div>
										<h2 className="text-white font-semibold text-lg">
											Сообщить об ошибке
										</h2>

										<p className="text-gray-400 text-sm">
											Опишите проблему подробно
										</p>
									</div>
								</div>

								<button
									onClick={() => setShowBug(false)}
									className="text-gray-400 hover:text-white transition"
								>
									✕
								</button>
							</div>

							<hr className="border-zinc-700" />

							<motion.form
								onSubmit={send_problem}
								initial="hidden"
								animate="visible"
								variants={{
									hidden: {},
									visible: {
										transition: {
											staggerChildren: 0.08,
										},
									},
								}}
								className="flex flex-col gap-4"
							>
								<motion.div
									variants={itemVariants}
									className="flex flex-col gap-2"
								>
									<label
										className="text-gray-400"
										htmlFor="theme"
									>
										Тема
									</label>

									<input
										required
										id="theme"
										type="text"
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										placeholder="Кратко опишите проблему..."
										className="bg-[#0f1629] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-red-500 transition"
									/>
								</motion.div>

								<motion.div
									variants={itemVariants}
									className="flex flex-col gap-2"
								>
									<label
										className="text-gray-400"
										htmlFor="description"
									>
										Описание проблемы
									</label>

									<textarea
										required
										id="description"
										rows={4}
										value={problem}
										onChange={(e) =>
											setProblem(e.target.value)
										}
										placeholder="Опишите проблему..."
										className="bg-[#0f1629] rounded-lg p-3 text-white outline-none resize-none focus:ring-2 focus:ring-red-500 transition"
									/>
								</motion.div>

								<motion.div
									variants={itemVariants}
									className="flex flex-col gap-2"
								>
									<label
										className="text-gray-400"
										htmlFor="email"
									>
										Ваш email (необязательно)
									</label>

									<input
										id="email"
										type="email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										placeholder="Ваш email..."
										className="bg-[#0f1629] rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-red-500 transition"
									/>
								</motion.div>

								<motion.div
									variants={itemVariants}
									className="flex gap-4 justify-center mt-4"
								>
									<button
										type="button"
										onClick={() =>
											setShowBug(false)
										}
										className="bg-[#3a3f5c] hover:bg-[#4a5072] transition text-white font-semibold px-5 py-2 rounded-lg"
									>
										Отмена
									</button>

									<button
										type="submit"
										className="bg-red-600 hover:bg-red-700 transition text-white font-semibold px-5 py-2 rounded-lg"
									>
										Отправить
									</button>
								</motion.div>
							</motion.form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}