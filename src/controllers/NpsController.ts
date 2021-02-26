import { Request, Response } from 'express';
import { getCustomRepository, Not, IsNull } from 'typeorm';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';

class NpsController {
    async execute(req: Request, res: Response){

        const { survey_id } = req.params;

        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
        const surveysUsers = await surveysUsersRepository.find({
            survey_id,
            value: Not(IsNull())
        });

        // Calculate NPS
        const detractors = surveysUsers.filter(survey => survey.value <= 6).length;
        const passives = surveysUsers.filter(survey => survey.value >= 7 && survey.value <= 8).length;
        const promoters = surveysUsers.filter(survey => survey.value >= 9).length;
        
        const totalAnswers = surveysUsers.length;

        const calculate = Number(
            (((promoters - detractors) / totalAnswers) * 100).toFixed(2)
        );
        
        return res.json({
            detractors,
            promoters,
            passives,
            totalAnswers,
            nps: calculate
        });
    };
};

export { NpsController };