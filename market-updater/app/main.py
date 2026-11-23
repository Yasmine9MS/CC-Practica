
import logging

from apscheduler.schedulers.blocking import BlockingScheduler

from .services import updateMarketData

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

scheduler = BlockingScheduler()


def scheduledMarketUpdate():

    try:
        updateMarketData()

    except Exception:
        logger.exception("Error updating market data")


if __name__ == "__main__":

    logger.info("Starting market updater...")

    scheduledMarketUpdate()

    scheduler.add_job(
        scheduledMarketUpdate,
        trigger="interval",
        seconds=60,
        id="market_update",
        max_instances=1,
        coalesce=True
    )

    logger.info("Market updater started. Interval: 60 seconds")

    try:
        scheduler.start()

    except (KeyboardInterrupt, SystemExit):
        logger.info("Market updater stopped")
