<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원모듈의 이벤트를 정의한다.
 *
 * @file /modules/member/classes/Event.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2025. 1. 2.
 */
namespace modules\member;
class Event extends \Event
{
    /**
     * 회원정보가 수정되었을 때
     */
    public static function updateMember(int $member_id): void
    {
    }
}
