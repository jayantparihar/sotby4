import Vacation from "./Vacation"
import React from 'react';
const VacationList = ({ vacations, onDelete }) => {
	return (
		<div>
			{vacations.map((vacation) => (
				<div key={vacation.id} className="vacation-column vacation-inputs">
					<Vacation vacation={vacation} onDelete={onDelete}
					/>
				</div>
			))}
		</div>
	);
};

export default VacationList;
