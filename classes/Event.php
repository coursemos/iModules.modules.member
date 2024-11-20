<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈의 이벤트를 정의한다.
 *
 * @file /modules/admin/classes/Event.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 11. 20.
 */
namespace modules\member;
class Event extends \Event
{
    /**
     * @param $member_id
     * @return void
     */
    public static function beforeAdminLayout($member_id): bool|null
    {
        return null;
    }
}
